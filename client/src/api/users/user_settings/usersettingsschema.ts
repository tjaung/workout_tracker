import { z } from 'zod'

export const themeModeSchema = z.enum(['system', 'light', 'dark'])
export const unitSystemSchema = z.enum(['imperial', 'metric'])

export const userSettingsSchema = z.object({
  user_settings_id: z.number(),
  user_id: z.number(),
  left_handed_mode: z.boolean(),
  theme_mode: themeModeSchema,
  unit_system: unitSystemSchema,
  workout_rest_timer_seconds: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const userSettingsUpdateSchema = userSettingsSchema
  .pick({
    left_handed_mode: true,
    theme_mode: true,
    unit_system: true,
    workout_rest_timer_seconds: true,
  })
  .partial()

export const userSettingsLogSchema = z.object({
  user_settings_log_id: z.number(),
  user_id: z.number(),
  setting_key: z.string(),
  old_value: z.unknown().nullable().optional(),
  new_value: z.unknown().nullable().optional(),
  changed_at: z.string(),
})

export type ThemeModePayload = z.infer<typeof themeModeSchema>
export type UnitSystemPayload = z.infer<typeof unitSystemSchema>
export type UserSettingsPayload = z.infer<typeof userSettingsSchema>
export type UserSettingsUpdatePayload = z.infer<typeof userSettingsUpdateSchema>
export type UserSettingsLogPayload = z.infer<typeof userSettingsLogSchema>
