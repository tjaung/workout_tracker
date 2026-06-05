import { z } from 'zod'
import { recordSourceSchema } from '@api/workouts/record_source'

export const userExerciseRecordSchema = z.object({
  record_id: z.number(),
  user_id: z.number(),
  exercise_id: z.number(),
  record_type_id: z.number(),
  workout_session_id: z.number().nullable().optional(),
  session_exercise_id: z.number().nullable().optional(),
  set_id: z.number().nullable().optional(),
  value: z.number(),
  source: recordSourceSchema,
  is_current: z.boolean(),
  achieved_at: z.string(),
  notes: z.string().max(500).nullable().optional(),
})

export const userExerciseRecordCreateSchema = userExerciseRecordSchema.omit({ record_id: true }).extend({
  achieved_at: z.string().nullable().optional(),
})

export const userExerciseRecordUpdateSchema = userExerciseRecordCreateSchema
  .omit({
    user_id: true,
    exercise_id: true,
    record_type_id: true,
  })
  .partial()

export type UserExerciseRecordPayload = z.infer<typeof userExerciseRecordSchema>
export type UserExerciseRecordCreatePayload = z.infer<typeof userExerciseRecordCreateSchema>
export type UserExerciseRecordUpdatePayload = z.infer<typeof userExerciseRecordUpdateSchema>
