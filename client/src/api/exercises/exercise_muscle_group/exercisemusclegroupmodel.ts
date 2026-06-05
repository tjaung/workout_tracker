import type { ExerciseMuscleGroupPayload } from './exercisemusclegroupschema'

export class ExerciseMuscleGroupModel {
  private readonly payload: ExerciseMuscleGroupPayload

  constructor(payload: ExerciseMuscleGroupPayload) {
    this.payload = payload
  }

  get exerciseId() {
    return this.payload.exercise_id
  }

  get muscleGroupId() {
    return this.payload.muscle_group_id
  }

  get displayRole() {
    return this.payload.is_primary ? 'Primary' : 'Secondary'
  }

  toJSON() {
    return this.payload
  }
}
