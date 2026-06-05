import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, type LoginPayload, type SignupPayload, type UserModel } from '@api/auth'
import { AuthContext } from '@contexts/authContextValue'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    const session = await authApi.getSession()
    setUser(session.user)
  }, [])

  useEffect(() => {
    let isMounted = true

    authApi
      .getSession()
      .then((session) => {
        if (isMounted) {
          setUser(session.user)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const auth = await authApi.login(payload)
    setUser(auth.user)
    return auth.user
  }, [])

  const signup = useCallback(async (payload: SignupPayload) => {
    await authApi.signup(payload)
    const auth = await authApi.login({
      password: payload.password,
      username: payload.username,
    })
    setUser(auth.user)
    return auth.user
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      refreshSession,
      signup,
      user,
    }),
    [isLoading, login, logout, refreshSession, signup, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
