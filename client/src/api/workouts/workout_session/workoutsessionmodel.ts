import { formatDate } from '@api/model'
import { WorkoutStatusModel } from '@api/workouts/workout_status'
import type { WorkoutSessionPayload } from './workoutsessionschema'

export class WorkoutSessionModel {
  private readonly payload: WorkoutSessionPayload

  constructor(payload: WorkoutSessionPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.workout_session_id
  }

  get userId() {
    return this.payload.user_id
  }

  get status() {
    return new WorkoutStatusModel(this.payload.status)
  }

  get displayStartTime() {
    return formatDate(this.payload.start_time)
  }

  get displayEndTime() {
    return formatDate(this.payload.end_time)
  }

  toJSON() {
    return this.payload
  }
}
