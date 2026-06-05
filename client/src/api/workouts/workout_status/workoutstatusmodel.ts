import type { WorkoutStatusPayload } from './workoutstatusschema'

export class WorkoutStatusModel {
  private readonly payload: WorkoutStatusPayload

  constructor(payload: WorkoutStatusPayload) {
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
