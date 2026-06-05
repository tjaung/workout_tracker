import { formatNumber } from '@api/model'
import type { ExerciseSetPayload } from './exercisesetschema'

export class ExerciseSetModel {
  private readonly payload: ExerciseSetPayload

  constructor(payload: ExerciseSetPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.set_id
  }

  get sessionExerciseId() {
    return this.payload.session_exercise_id
  }

  get displaySetNumber() {
    return `Set ${this.payload.set_number}`
  }

  get displayReps() {
    return formatNumber(this.payload.reps)
  }

  get displayWeight() {
    return formatNumber(this.payload.weight)
  }

  toJSON() {
    return this.payload
  }
}
