import { z } from 'zod'

export const exerciseTypeValues = ['WEIGHT', 'CARDIO', 'BODYWEIGHT', 'MOBILITY', 'OTHER'] as const
export const exerciseTypeSchema = z.enum(exerciseTypeValues)
export type ExerciseTypePayload = z.infer<typeof exerciseTypeSchema>
