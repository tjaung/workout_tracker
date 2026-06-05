import { z } from 'zod'

export const userSchema = z.object({
  user_id: z.number(),
  username: z.string().min(1).max(50),
  email: z.string().min(1).max(255),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  created_at: z.string(),
  last_login: z.string().nullable().optional(),
})

export const userCreateSchema = userSchema
  .pick({
    username: true,
    email: true,
    first_name: true,
    last_name: true,
  })
  .extend({
    password: z.string().min(8).max(255),
  })

export const userUpdateSchema = userCreateSchema.partial()

export type UserPayload = z.infer<typeof userSchema>
export type UserCreatePayload = z.infer<typeof userCreateSchema>
export type UserUpdatePayload = z.infer<typeof userUpdateSchema>
