import { z } from 'zod'

export const progressBodyMeasurementPointSchema = z.object({
  body_fat_percentage: z.number().nullable().optional(),
  height_cm: z.number().nullable().optional(),
  measured_at: z.string(),
  measurement_id: z.number(),
  weight_kg: z.number().nullable().optional(),
})

export const progressWorkoutPointSchema = z.object({
  duration_minutes: z.number().nullable().optional(),
  end_time: z.string().nullable().optional(),
  exercise_count: z.number(),
  routine_id: z.number().nullable().optional(),
  routine_name: z.string().nullable().optional(),
  set_count: z.number(),
  split_id: z.number().nullable().optional(),
  split_name: z.string().nullable().optional(),
  start_time: z.string(),
  status: z.string(),
  workout_session_id: z.number(),
})

export const progressRoutinePointSchema = z.object({
  end_date: z.string().nullable().optional(),
  is_active: z.boolean(),
  routine_id: z.number(),
  routine_name: z.string(),
  routine_type: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
})

export const progressExercisePointSchema = z.object({
  average_weight: z.number().nullable().optional(),
  exercise_id: z.number(),
  exercise_name: z.string(),
  exercise_type: z.string(),
  max_duration_seconds: z.number().nullable().optional(),
  max_weight: z.number().nullable().optional(),
  performed_at: z.string(),
  rep_count: z.number(),
  routine_id: z.number().nullable().optional(),
  routine_name: z.string().nullable().optional(),
  session_exercise_id: z.number(),
  set_count: z.number(),
  split_id: z.number().nullable().optional(),
  split_name: z.string().nullable().optional(),
  total_distance: z.number().nullable().optional(),
  total_duration_seconds: z.number(),
  workout_session_id: z.number(),
})

export const progressRecordPointSchema = z.object({
  achieved_at: z.string(),
  exercise_id: z.number(),
  exercise_name: z.string(),
  is_current: z.boolean(),
  record_id: z.number(),
  record_type_id: z.number(),
  record_type_name: z.string(),
  value: z.number(),
})

export const progressSummarySchema = z.object({
  active_days: z.number(),
  average_workout_duration_minutes: z.number().nullable().optional(),
  cumulative_workouts: z.number(),
  record_changes: z.number(),
  routines_ended: z.number(),
  routines_started: z.number(),
  weight_change_kg: z.number().nullable().optional(),
})

export const progressAggregatePointSchema = z.object({
  period_start: z.string(),
  values: z.record(z.string(), z.number().nullable()),
})

export type ProgressBodyMeasurementPointPayload = z.infer<typeof progressBodyMeasurementPointSchema>
export type ProgressWorkoutPointPayload = z.infer<typeof progressWorkoutPointSchema>
export type ProgressRoutinePointPayload = z.infer<typeof progressRoutinePointSchema>
export type ProgressExercisePointPayload = z.infer<typeof progressExercisePointSchema>
export type ProgressRecordPointPayload = z.infer<typeof progressRecordPointSchema>
export type ProgressSummaryPayload = z.infer<typeof progressSummarySchema>
export type ProgressAggregatePointPayload = z.infer<typeof progressAggregatePointSchema>
