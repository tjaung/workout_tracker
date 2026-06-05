import { z } from 'zod'
import { exerciseTypeSchema } from '@api/exercises/exercise_type'
import { weightUnitSchema } from '@api/programming/split_exercise'

export const routineTypeSchema = z.enum(['CARDIO', 'WEIGHT_TRAINING', 'MOBILITY'])
export const routineGoalSchema = z.enum(['WEIGHT_LOSS', 'MUSCLE_GROWTH', 'STRENGTH', 'ENDURANCE', 'FLEXIBILITY'])
export const routineIntensitySchema = z.enum(['LOW', 'MODERATE', 'HIGH'])

export const routineSchema = z.object({
  routine_id: z.number(),
  created_by_user_id: z.number().nullable().optional(),
  routine_name: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
  routine_type: routineTypeSchema.nullable().optional(),
  goal: routineGoalSchema.nullable().optional(),
  intensity: routineIntensitySchema.nullable().optional(),
  is_global: z.boolean(),
  is_active: z.boolean(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  created_at: z.string(),
})

export const routineCreateSchema = routineSchema.omit({
  routine_id: true,
  created_at: true,
})

export const routineUpdateSchema = routineCreateSchema.partial()

export const routineExerciseSummarySchema = z.object({
  exercise_id: z.number(),
  name: z.string(),
  exercise_type: exerciseTypeSchema,
})

export const routineSplitExerciseDetailSchema = z.object({
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
  notes: z.string().nullable().optional(),
  exercise: routineExerciseSummarySchema,
})

export const routineSplitSummarySchema = z.object({
  split_id: z.number(),
  created_by_user_id: z.number().nullable().optional(),
  split_name: z.string(),
  is_global: z.boolean(),
  created_at: z.string(),
  split_exercises: z.array(routineSplitExerciseDetailSchema),
})

export const routineSplitDetailSchema = z.object({
  routine_id: z.number(),
  split_id: z.number(),
  split_order: z.number(),
  day_of_week: z.string().nullable().optional(),
  split: routineSplitSummarySchema,
})

export const routineDetailSchema = routineSchema.extend({
  routine_splits: z.array(routineSplitDetailSchema),
})

export const routineFullSplitExerciseCreateSchema = z.object({
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

export const routineFullSplitCreateSchema = z.object({
  split_name: z.string().min(1).max(120),
  split_order: z.number(),
  day_of_week: z.string().nullable().optional(),
  exercises: z.array(routineFullSplitExerciseCreateSchema),
})

export const routineFullCreateSchema = z.object({
  routine_name: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
  routine_type: routineTypeSchema.nullable().optional(),
  goal: routineGoalSchema.nullable().optional(),
  intensity: routineIntensitySchema.nullable().optional(),
  is_global: z.boolean(),
  start_now: z.boolean(),
  splits: z.array(routineFullSplitCreateSchema).min(1),
})

export type RoutinePayload = z.infer<typeof routineSchema>
export type RoutineCreatePayload = z.infer<typeof routineCreateSchema>
export type RoutineDetailPayload = z.infer<typeof routineDetailSchema>
export type RoutineFullCreatePayload = z.infer<typeof routineFullCreateSchema>
export type RoutineFullSplitCreatePayload = z.infer<typeof routineFullSplitCreateSchema>
export type RoutineFullSplitExerciseCreatePayload = z.infer<typeof routineFullSplitExerciseCreateSchema>
export type RoutineGoalPayload = z.infer<typeof routineGoalSchema>
export type RoutineIntensityPayload = z.infer<typeof routineIntensitySchema>
export type RoutineSplitDetailPayload = z.infer<typeof routineSplitDetailSchema>
export type RoutineSplitExerciseDetailPayload = z.infer<typeof routineSplitExerciseDetailSchema>
export type RoutineTypePayload = z.infer<typeof routineTypeSchema>
export type RoutineUpdatePayload = z.infer<typeof routineUpdateSchema>
