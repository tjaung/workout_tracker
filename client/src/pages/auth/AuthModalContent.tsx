import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '@api/index'
import { useAuth } from '@hooks/auth/useAuth'
import { useModal } from '@hooks/modal/useModal'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'

interface AuthModalContentProps {
  mode: 'signin' | 'signup'
}

export function AuthModalContent({ mode }: AuthModalContentProps) {
  const { closeModal } = useModal()
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    try {
      if (isSignup) {
        await signup({
          email: String(formData.get('email') ?? ''),
          date_of_birth: String(formData.get('dateOfBirth') ?? ''),
          first_name: String(formData.get('firstName') ?? ''),
          last_name: String(formData.get('lastName') ?? ''),
          password: String(formData.get('password') ?? ''),
          sex: String(formData.get('sex') ?? '') as 'female' | 'male',
          username: String(formData.get('username') ?? ''),
        })
      } else {
        await login({
          password: String(formData.get('password') ?? ''),
          username: String(formData.get('username') ?? ''),
        })
      }
      closeModal()
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isSignup ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            First name
            <Input name="firstName" autoComplete="given-name" required />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            Last name
            <Input name="lastName" autoComplete="family-name" required />
          </label>
        </div>
      ) : null}

      {isSignup ? (
        <>
          <label className="block space-y-1.5 text-sm font-medium text-foreground">
            Email
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium text-foreground">
              Date of birth
              <Input name="dateOfBirth" type="date" required />
            </label>
            <label className="space-y-1.5 text-sm font-medium text-foreground">
              Sex
              <select
                className="h-10 w-full cursor-pointer rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                name="sex"
                required
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
          </div>
        </>
      ) : null}

      <label className="block space-y-1.5 text-sm font-medium text-foreground">
        Username
        <Input name="username" autoComplete="username" required />
      </label>

      <label className="block space-y-1.5 text-sm font-medium text-foreground">
        Password
        <Input
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={isSignup ? 8 : 1}
          required
        />
      </label>

      {error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? 'Working...' : isSignup ? 'Create account' : 'Sign in'}
      </Button>
    </form>
  )
}
