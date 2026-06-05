import { z } from 'zod'

export const comparisonTypeValues = ['HIGHER_IS_BETTER', 'LOWER_IS_BETTER'] as const
export const comparisonTypeSchema = z.enum(comparisonTypeValues)
export type ComparisonTypePayload = z.infer<typeof comparisonTypeSchema>
