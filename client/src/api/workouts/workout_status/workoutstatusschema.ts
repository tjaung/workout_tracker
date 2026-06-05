import { z } from 'zod'

export const workoutStatusValues = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'] as const
export const workoutStatusSchema = z.enum(workoutStatusValues)
export type WorkoutStatusPayload = z.infer<typeof workoutStatusSchema>
