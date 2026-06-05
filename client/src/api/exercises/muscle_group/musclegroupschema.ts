import { z } from 'zod'

export const muscleGroupSchema = z.object({
  muscle_group_id: z.number(),
  name: z.string().min(1).max(80),
})

export const muscleGroupCreateSchema = muscleGroupSchema.omit({ muscle_group_id: true })
export const muscleGroupUpdateSchema = muscleGroupCreateSchema.partial()

export type MuscleGroupPayload = z.infer<typeof muscleGroupSchema>
export type MuscleGroupCreatePayload = z.infer<typeof muscleGroupCreateSchema>
export type MuscleGroupUpdatePayload = z.infer<typeof muscleGroupUpdateSchema>
