import { z } from 'zod'

export const recordSourceValues = ['MANUAL', 'WORKOUT_DERIVED', 'ESTIMATED'] as const
export const recordSourceSchema = z.enum(recordSourceValues)
export type RecordSourcePayload = z.infer<typeof recordSourceSchema>
