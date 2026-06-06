import { z } from 'zod'
import { sessionExerciseStatusSchema } from '@api/workouts/session_exercise_status'

export const sessionExerciseSchema = z.object({
  session_exercise_id: z.number(),
  workout_session_id: z.number(),
  exercise_id: z.number(),
  source_split_exercise_id: z.number().nullable().optional(),
  exercise_order: z.number(),
  status: sessionExerciseStatusSchema,
  notes: z.string().max(500).nullable().optional(),
})

export const sessionExerciseCreateSchema = sessionExerciseSchema.omit({ session_exercise_id: true })
export const sessionExerciseUpdateSchema = sessionExerciseCreateSchema
  .omit({
    workout_session_id: true,
    exercise_id: true,
  })
  .partial()

export type SessionExercisePayload = z.infer<typeof sessionExerciseSchema>
export type SessionExerciseCreatePayload = z.infer<typeof sessionExerciseCreateSchema>
export type SessionExerciseUpdatePayload = z.infer<typeof sessionExerciseUpdateSchema>
