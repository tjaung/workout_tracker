import { z } from 'zod'
import { comparisonTypeSchema } from '@api/exercises/comparison_type'
import { recordCategorySchema } from '@api/exercises/record_category'

export const recordTypeSchema = z.object({
  record_type_id: z.number(),
  name: z.string().min(1).max(120),
  record_category: recordCategorySchema,
  comparison_type: comparisonTypeSchema,
  default_unit: z.string().min(1).max(40),
})

export const recordTypeCreateSchema = recordTypeSchema.omit({ record_type_id: true })
export const recordTypeUpdateSchema = recordTypeCreateSchema.partial()

export type RecordTypePayload = z.infer<typeof recordTypeSchema>
export type RecordTypeCreatePayload = z.infer<typeof recordTypeCreateSchema>
export type RecordTypeUpdatePayload = z.infer<typeof recordTypeUpdateSchema>
