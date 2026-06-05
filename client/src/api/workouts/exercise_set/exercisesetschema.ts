import { z } from 'zod'

export const exerciseSetSchema = z.object({
  set_id: z.number(),
  session_exercise_id: z.number(),
  set_number: z.number(),
  reps: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  distance: z.number().nullable().optional(),
  intensity: z.string().max(80).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const exerciseSetCreateSchema = exerciseSetSchema.omit({ set_id: true })
export const exerciseSetUpdateSchema = exerciseSetCreateSchema.omit({ session_exercise_id: true }).partial()

export type ExerciseSetPayload = z.infer<typeof exerciseSetSchema>
export type ExerciseSetCreatePayload = z.infer<typeof exerciseSetCreateSchema>
export type ExerciseSetUpdatePayload = z.infer<typeof exerciseSetUpdateSchema>
