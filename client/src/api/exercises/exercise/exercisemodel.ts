import { formatDate } from '@api/model'
import { ExerciseTypeModel } from '@api/exercises/exercise_type'
import type { ExercisePayload } from './exerciseschema'

export class ExerciseModel {
  private readonly payload: ExercisePayload

  constructor(payload: ExercisePayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.exercise_id
  }

  get name() {
    return this.payload.name
  }

  get exerciseType() {
    return new ExerciseTypeModel(this.payload.exercise_type)
  }

  get exerciseTypeValue() {
    return this.payload.exercise_type
  }

  get equipment() {
    return this.payload.equipment
  }

  get muscleGroups() {
    return this.payload.muscle_groups ?? []
  }

  get bodyParts() {
    return this.muscleGroups.map((muscleGroup) => muscleGroup.muscle_group.name)
  }

  get preparation() {
    return this.payload.preparation
  }

  get execution() {
    return this.payload.execution
  }

  get displayEquipment() {
    return this.payload.equipment ?? 'No equipment listed'
  }

  get displayBodyParts() {
    return this.bodyParts.length > 0 ? this.bodyParts.join(', ') : 'No body part listed'
  }

  get displayCreatedAt() {
    return formatDate(this.payload.created_at)
  }

  get displayScope() {
    return this.payload.is_global ? 'Global' : 'Personal'
  }

  toJSON() {
    return this.payload
  }
}
