import { z } from 'zod'
import { workoutStatusSchema } from '@api/workouts/workout_status'

export const workoutSessionSchema = z.object({
  workout_session_id: z.number(),
  user_id: z.number(),
  routine_id: z.number().nullable().optional(),
  split_id: z.number().nullable().optional(),
  start_time: z.string(),
  end_time: z.string().nullable().optional(),
  status: workoutStatusSchema,
  notes: z.string().max(500).nullable().optional(),
})

export const workoutSessionCreateSchema = workoutSessionSchema.omit({ workout_session_id: true }).extend({
  start_time: z.string().nullable().optional(),
})

export const workoutSessionUpdateSchema = workoutSessionCreateSchema.omit({ user_id: true }).partial()

export type WorkoutSessionPayload = z.infer<typeof workoutSessionSchema>
export type WorkoutSessionCreatePayload = z.infer<typeof workoutSessionCreateSchema>
export type WorkoutSessionUpdatePayload = z.infer<typeof workoutSessionUpdateSchema>
