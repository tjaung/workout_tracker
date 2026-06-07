import { z } from 'zod'

export const recordExerciseOptionSchema = z.object({
  exercise_id: z.number(),
  name: z.string(),
  exercise_type: z.string(),
  equipment: z.string().nullable().optional(),
})

export const exerciseRecordValueSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number().nullable(),
  unit: z.string(),
  source: z.string(),
  display_value: z.string(),
})

export const exerciseRecordSummarySchema = z.object({
  exercise: recordExerciseOptionSchema,
  records: z.array(exerciseRecordValueSchema),
})

export const manualExerciseRecordInputSchema = z.object({
  key: z.string(),
  notes: z.string().nullable().optional(),
  value: z.number().min(0),
})

export const manualExerciseRecordRequestSchema = z.object({
  records: z.array(manualExerciseRecordInputSchema),
})

export type RecordExerciseOptionPayload = z.infer<typeof recordExerciseOptionSchema>
export type ExerciseRecordValuePayload = z.infer<typeof exerciseRecordValueSchema>
export type ExerciseRecordSummaryPayload = z.infer<typeof exerciseRecordSummarySchema>
export type ManualExerciseRecordInputPayload = z.infer<typeof manualExerciseRecordInputSchema>
export type ManualExerciseRecordRequestPayload = z.infer<typeof manualExerciseRecordRequestSchema>
