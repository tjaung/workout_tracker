import { z } from 'zod'

export const sessionExerciseStatusSchema = z.enum(['COMPLETED', 'PARTIAL', 'SKIPPED'])

export type SessionExerciseStatusPayload = z.infer<typeof sessionExerciseStatusSchema>

export class SessionExerciseStatusModel {
  private readonly value: SessionExerciseStatusPayload

  constructor(value: SessionExerciseStatusPayload) {
    this.value = value
  }

  get displayName() {
    return this.value.replaceAll('_', ' ').toLowerCase()
  }

  get raw() {
    return this.value
  }
}
