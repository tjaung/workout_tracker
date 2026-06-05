import { z } from 'zod'

export const weightUnitSchema = z.enum(['LB', 'KG', 'PERCENT_1RM'])

export const splitExerciseSchema = z.object({
  split_exercise_id: z.number(),
  split_id: z.number(),
  exercise_id: z.number(),
  exercise_order: z.number(),
  default_sets: z.number().nullable().optional(),
  default_reps: z.number().nullable().optional(),
  default_weight_value: z.number().nullable().optional(),
  default_weight_unit: weightUnitSchema.nullable().optional(),
  default_duration_seconds: z.number().nullable().optional(),
  default_distance: z.number().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const splitExerciseCreateSchema = splitExerciseSchema.omit({ split_exercise_id: true })
export const splitExerciseUpdateSchema = splitExerciseCreateSchema
  .omit({
    split_id: true,
    exercise_id: true,
  })
  .partial()

export type SplitExercisePayload = z.infer<typeof splitExerciseSchema>
export type SplitExerciseCreatePayload = z.infer<typeof splitExerciseCreateSchema>
export type SplitExerciseUpdatePayload = z.infer<typeof splitExerciseUpdateSchema>
export type WeightUnitPayload = z.infer<typeof weightUnitSchema>
