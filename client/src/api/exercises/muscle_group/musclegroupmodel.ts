import type { MuscleGroupPayload } from './musclegroupschema'

export class MuscleGroupModel {
  private readonly payload: MuscleGroupPayload

  constructor(payload: MuscleGroupPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.muscle_group_id
  }

  get name() {
    return this.payload.name
  }

  get displayName() {
    return this.payload.name
  }

  toJSON() {
    return this.payload
  }
}
