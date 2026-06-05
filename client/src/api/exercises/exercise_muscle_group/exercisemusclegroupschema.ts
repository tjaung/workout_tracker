import { z } from 'zod'

export const exerciseMuscleGroupSchema = z.object({
  exercise_id: z.number(),
  muscle_group_id: z.number(),
  is_primary: z.boolean(),
})

export const exerciseMuscleGroupCreateSchema = exerciseMuscleGroupSchema
export const exerciseMuscleGroupUpdateSchema = exerciseMuscleGroupSchema.pick({ is_primary: true }).partial()

export type ExerciseMuscleGroupPayload = z.infer<typeof exerciseMuscleGroupSchema>
export type ExerciseMuscleGroupCreatePayload = z.infer<typeof exerciseMuscleGroupCreateSchema>
export type ExerciseMuscleGroupUpdatePayload = z.infer<typeof exerciseMuscleGroupUpdateSchema>
export type ExerciseMuscleGroupId = Pick<ExerciseMuscleGroupPayload, 'exercise_id' | 'muscle_group_id'>
