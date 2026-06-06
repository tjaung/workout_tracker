import type { SessionExercisePayload } from './sessionexerciseschema'

export class SessionExerciseModel {
  private readonly payload: SessionExercisePayload

  constructor(payload: SessionExercisePayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.session_exercise_id
  }

  get workoutSessionId() {
    return this.payload.workout_session_id
  }

  get exerciseId() {
    return this.payload.exercise_id
  }

  get order() {
    return this.payload.exercise_order
  }

  get status() {
    return this.payload.status
  }

  toJSON() {
    return this.payload
  }
}
