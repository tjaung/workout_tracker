import { z } from 'zod'

export const recordCategoryValues = ['STRENGTH', 'ENDURANCE', 'DISTANCE', 'TIME', 'BODYWEIGHT', 'OTHER'] as const
export const recordCategorySchema = z.enum(recordCategoryValues)
export type RecordCategoryPayload = z.infer<typeof recordCategorySchema>
