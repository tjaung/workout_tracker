import { z } from 'zod'
import { sessionExerciseStatusSchema } from '@api/workouts/session_exercise_status'
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

export const currentWorkoutExerciseSchema = z.object({
  source_split_exercise_id: z.number().nullable().optional(),
  exercise_id: z.number(),
  name: z.string(),
  exercise_type: z.string().nullable().optional(),
  equipment: z.string().nullable().optional(),
  preparation: z.string().nullable().optional(),
  execution: z.string().nullable().optional(),
  exercise_order: z.number(),
  status: sessionExerciseStatusSchema,
  default_sets: z.number().nullable().optional(),
  default_reps: z.number().nullable().optional(),
  default_weight_value: z.number().nullable().optional(),
  default_weight_unit: z.string().nullable().optional(),
  default_duration_seconds: z.number().nullable().optional(),
  default_distance: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const startWorkoutSchema = z.object({
  source: z.enum(['current', 'empty']),
})

export const completeWorkoutSetSchema = z.object({
  set_number: z.number(),
  reps: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  distance: z.number().nullable().optional(),
  intensity: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const completeWorkoutExerciseSchema = z.object({
  exercise_id: z.number(),
  source_split_exercise_id: z.number().nullable().optional(),
  exercise_order: z.number(),
  status: sessionExerciseStatusSchema,
  notes: z.string().nullable().optional(),
  sets: z.array(completeWorkoutSetSchema),
})

export const completeWorkoutSchema = z.object({
  notes: z.string().nullable().optional(),
  exercises: z.array(completeWorkoutExerciseSchema),
})

export const currentWorkoutSchema = z.object({
  state: z.enum(['IN_PROGRESS_SESSION', 'INCOMPLETE_SESSION', 'NEXT_SCHEDULED', 'NO_ACTIVE_ROUTINE', 'NO_SCHEDULED_WORKOUT']),
  routine_id: z.number().nullable().optional(),
  routine_name: z.string().nullable().optional(),
  split_id: z.number().nullable().optional(),
  split_name: z.string().nullable().optional(),
  day_of_week: z.string().nullable().optional(),
  scheduled_date: z.string().nullable().optional(),
  workout_session_id: z.number().nullable().optional(),
  status: workoutStatusSchema.nullable().optional(),
  exercises: z.array(currentWorkoutExerciseSchema),
})

export const workoutHistorySetSchema = z.object({
  set_id: z.number(),
  set_number: z.number(),
  reps: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  distance: z.number().nullable().optional(),
  intensity: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const workoutHistoryExerciseSchema = z.object({
  session_exercise_id: z.number(),
  exercise_id: z.number(),
  name: z.string(),
  exercise_order: z.number(),
  status: sessionExerciseStatusSchema,
  notes: z.string().nullable().optional(),
  sets: z.array(workoutHistorySetSchema),
})

export const workoutHistoryItemSchema = z.object({
  workout_session_id: z.number(),
  routine_id: z.number().nullable().optional(),
  routine_name: z.string().nullable().optional(),
  split_id: z.number().nullable().optional(),
  split_name: z.string().nullable().optional(),
  start_time: z.string(),
  end_time: z.string().nullable().optional(),
  status: workoutStatusSchema,
  notes: z.string().nullable().optional(),
  exercises: z.array(workoutHistoryExerciseSchema),
})

export type CurrentWorkoutExercisePayload = z.infer<typeof currentWorkoutExerciseSchema>
export type CurrentWorkoutPayload = z.infer<typeof currentWorkoutSchema>
export type CompleteWorkoutExercisePayload = z.infer<typeof completeWorkoutExerciseSchema>
export type CompleteWorkoutPayload = z.infer<typeof completeWorkoutSchema>
export type CompleteWorkoutSetPayload = z.infer<typeof completeWorkoutSetSchema>
export type StartWorkoutPayload = z.infer<typeof startWorkoutSchema>
export type WorkoutHistoryExercisePayload = z.infer<typeof workoutHistoryExerciseSchema>
export type WorkoutHistoryItemPayload = z.infer<typeof workoutHistoryItemSchema>
export type WorkoutHistorySetPayload = z.infer<typeof workoutHistorySetSchema>
export type WorkoutSessionPayload = z.infer<typeof workoutSessionSchema>
export type WorkoutSessionCreatePayload = z.infer<typeof workoutSessionCreateSchema>
export type WorkoutSessionUpdatePayload = z.infer<typeof workoutSessionUpdateSchema>
