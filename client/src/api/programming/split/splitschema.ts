import { z } from 'zod'

export const splitSchema = z.object({
  split_id: z.number(),
  created_by_user_id: z.number().nullable().optional(),
  split_name: z.string().min(1).max(120),
  is_global: z.boolean(),
  created_at: z.string(),
})

export const splitCreateSchema = splitSchema.omit({
  split_id: true,
  created_at: true,
})

export const splitUpdateSchema = splitCreateSchema.partial()

export type SplitPayload = z.infer<typeof splitSchema>
export type SplitCreatePayload = z.infer<typeof splitCreateSchema>
export type SplitUpdatePayload = z.infer<typeof splitUpdateSchema>
