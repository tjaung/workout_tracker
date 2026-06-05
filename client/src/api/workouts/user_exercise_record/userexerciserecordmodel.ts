import { formatDate, formatNumber } from '@api/model'
import { RecordSourceModel } from '@api/workouts/record_source'
import type { UserExerciseRecordPayload } from './userexerciserecordschema'

export class UserExerciseRecordModel {
  private readonly payload: UserExerciseRecordPayload

  constructor(payload: UserExerciseRecordPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.record_id
  }

  get userId() {
    return this.payload.user_id
  }

  get exerciseId() {
    return this.payload.exercise_id
  }

  get source() {
    return new RecordSourceModel(this.payload.source)
  }

  get displayValue() {
    return formatNumber(this.payload.value)
  }

  get displayAchievedAt() {
    return formatDate(this.payload.achieved_at)
  }

  get displayStatus() {
    return this.payload.is_current ? 'Current' : 'Historical'
  }

  toJSON() {
    return this.payload
  }
}
