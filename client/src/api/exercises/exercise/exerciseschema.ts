import { z } from 'zod'
import { exerciseTypeSchema } from '@api/exercises/exercise_type'
import { muscleGroupSchema } from '@api/exercises/muscle_group'

export const exerciseMuscleGroupDetailSchema = z.object({
  exercise_id: z.number(),
  muscle_group_id: z.number(),
  is_primary: z.boolean(),
  muscle_group: muscleGroupSchema,
})

export const exerciseSchema = z.object({
  exercise_id: z.number(),
  name: z.string().min(1).max(120),
  exercise_type: exerciseTypeSchema,
  muscle_groups: z.array(exerciseMuscleGroupDetailSchema).optional(),
  equipment: z.string().max(120).nullable().optional(),
  preparation: z.string().nullable().optional(),
  execution: z.string().nullable().optional(),
  created_by_user_id: z.number().nullable().optional(),
  is_global: z.boolean(),
  created_at: z.string(),
})

export const exerciseCreateSchema = exerciseSchema.omit({
  exercise_id: true,
  created_at: true,
})

export const exerciseUpdateSchema = exerciseCreateSchema.partial()

export type ExerciseMuscleGroupDetailPayload = z.infer<typeof exerciseMuscleGroupDetailSchema>
export type ExercisePayload = z.infer<typeof exerciseSchema>
export type ExerciseCreatePayload = z.infer<typeof exerciseCreateSchema>
export type ExerciseUpdatePayload = z.infer<typeof exerciseUpdateSchema>
