import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthModalContent } from '@pages/auth/AuthModalContent'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { Loading } from '@components/ui/loading'
import { useAuth } from '@hooks/auth/useAuth'
import { useModal } from '@hooks/modal/useModal'

export function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { openModal } = useModal()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return <Loading fullPage label="Loading session" size="lg" />
  }

  return (
    <div className="flex min-h-svh min-w-full bg-background text-foreground">
      <section className="hidden w-1/2 items-center justify-center bg-surface p-12 lg:flex">
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative flex h-80 w-80 items-center justify-center rounded-lg border border-border bg-secondary p-6 shadow-md">
            <div className="absolute inset-8 rounded-full bg-primary blur-3xl opacity-30" />
            <div className="relative flex h-full w-full items-center justify-center rounded-md border border-primary text-7xl font-black tracking-tight text-primary">
              WT
            </div>
          </div>
          <div className="max-w-sm text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-muted">
              Workout Tracker
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Build the routine. Track the proof.
            </h2>
          </div>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-alabaster-grey p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-8">
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
                  Welcome back
                </p>
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                  Your training starts now
                </h1>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  variant="secondary"
                  onClick={() =>
                    openModal(<AuthModalContent mode="signin" />, {
                      title: 'Sign in',
                    })
                  }
                >
                  Sign in
                </Button>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    openModal(<AuthModalContent mode="signup" />, {
                      title: 'Create account',
                    })
                  }
                >
                  Create account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
