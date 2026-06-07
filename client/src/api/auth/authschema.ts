import { z } from 'zod'

export const userSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  sex: z.enum(['female', 'male']),
  date_of_birth: z.string(),
  created_at: z.string(),
  last_login: z.string().nullable(),
})

export const signupPayloadSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email().max(255),
  password: z.string().min(8).max(255),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  sex: z.enum(['female', 'male']),
  date_of_birth: z.string().min(1),
})

export const loginPayloadSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
})

export const authResponseSchema = z.object({
  user: userSchema,
})

export const sessionStatusSchema = z.object({
  authenticated: z.boolean(),
  user: userSchema.nullable().optional(),
})

export const csrfResponseSchema = z.object({
  csrf_token: z.string(),
  header_name: z.string(),
})

export type UserPayload = z.infer<typeof userSchema>
export type SignupPayload = z.infer<typeof signupPayloadSchema>
export type LoginPayload = z.infer<typeof loginPayloadSchema>
export type AuthResponsePayload = z.infer<typeof authResponseSchema>
export type SessionStatusPayload = z.infer<typeof sessionStatusSchema>
export type CsrfResponsePayload = z.infer<typeof csrfResponseSchema>
