import { z } from 'zod'

export const routineSplitSchema = z.object({
  day_of_week: z.string().nullable().optional(),
  routine_id: z.number(),
  split_id: z.number(),
  split_order: z.number(),
})

export const routineSplitCreateSchema = routineSplitSchema
export const routineSplitUpdateSchema = routineSplitSchema.pick({ day_of_week: true, split_order: true }).partial()

export type RoutineSplitPayload = z.infer<typeof routineSplitSchema>
export type RoutineSplitCreatePayload = z.infer<typeof routineSplitCreateSchema>
export type RoutineSplitUpdatePayload = z.infer<typeof routineSplitUpdateSchema>
export type RoutineSplitId = Pick<RoutineSplitPayload, 'routine_id' | 'split_id'>
