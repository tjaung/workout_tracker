import { z } from 'zod'

export const bodyMeasurementSchema = z.object({
  measurement_id: z.number(),
  user_id: z.number(),
  measured_at: z.string(),
  height_cm: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  body_fat_percentage: z.number().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const bodyMeasurementCreateSchema = bodyMeasurementSchema
  .omit({ measurement_id: true })
  .extend({
    measured_at: z.string().nullable().optional(),
  })

export const bodyMeasurementUpdateSchema = bodyMeasurementCreateSchema.omit({ user_id: true }).partial()

export type BodyMeasurementPayload = z.infer<typeof bodyMeasurementSchema>
export type BodyMeasurementCreatePayload = z.infer<typeof bodyMeasurementCreateSchema>
export type BodyMeasurementUpdatePayload = z.infer<typeof bodyMeasurementUpdateSchema>
