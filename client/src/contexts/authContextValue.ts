import { createContext } from 'react'
import type { LoginPayload, SignupPayload, UserModel } from '@api/auth'

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<UserModel>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  signup: (payload: SignupPayload) => Promise<UserModel>
  user: UserModel | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
