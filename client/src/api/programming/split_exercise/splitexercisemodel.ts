import { formatNumber } from '@api/model'
import type { SplitExercisePayload } from './splitexerciseschema'

export class SplitExerciseModel {
  private readonly payload: SplitExercisePayload

  constructor(payload: SplitExercisePayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.split_exercise_id
  }

  get splitId() {
    return this.payload.split_id
  }

  get exerciseId() {
    return this.payload.exercise_id
  }

  get order() {
    return this.payload.exercise_order
  }

  get displayPrescription() {
    const parts: string[] = []
    if (this.payload.default_sets || this.payload.default_reps) {
      const sets = formatNumber(this.payload.default_sets)
      const reps = formatNumber(this.payload.default_reps)
      parts.push(`${sets} sets x ${reps} reps`)
    }
    if (this.payload.default_weight_value) {
      const unit = this.payload.default_weight_unit === 'PERCENT_1RM' ? '% 1RM' : this.payload.default_weight_unit
      parts.push(`${this.payload.default_weight_value} ${unit ?? ''}`.trim())
    }
    if (this.payload.default_duration_seconds) {
      parts.push(`${this.payload.default_duration_seconds}s`)
    }
    if (this.payload.default_distance) {
      parts.push(`${this.payload.default_distance} mi`)
    }
    return parts.length > 0 ? parts.join(' - ') : 'No defaults'
  }

  toJSON() {
    return this.payload
  }
}
