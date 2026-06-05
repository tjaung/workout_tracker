import type { ExerciseTypePayload } from './exercisetypeschema'

export class ExerciseTypeModel {
  private readonly payload: ExerciseTypePayload

  constructor(payload: ExerciseTypePayload) {
    this.payload = payload
  }

  get value() {
    return this.payload
  }

  get displayName() {
    return this.payload.replaceAll('_', ' ').toLowerCase()
  }

  toJSON() {
    return this.payload
  }
}
