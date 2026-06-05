import { Dumbbell, Library } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '@components/ui/back-button'
import { Card, CardContent } from '@components/ui/card'

const routineOptions = [
  {
    description: 'Start from a public template and customize it for your training.',
    icon: Library,
    path: '/routines/add-routine/routine-list',
    title: 'Choose a premade routine',
  },
  {
    description: 'Create your own routine from scratch with custom splits and exercises.',
    icon: Dumbbell,
    path: '/routines/add-routine/build',
    title: 'Build my own routine',
  },
]

export function AddRoutinePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <BackButton />

      <div className="grid min-h-[60svh] gap-5 md:grid-cols-2">
        {routineOptions.map((option) => {
          const Icon = option.icon

          return (
            <Card
              className="group cursor-pointer transition-colors hover:border-primary hover:bg-primary/10 focus-within:border-primary focus-within:bg-primary/10"
              key={option.title}
              onClick={() => navigate(option.path)}
            >
              <CardContent
                className="flex h-full min-h-72 flex-col justify-between p-6 sm:p-8"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(option.path)
                  }
                }}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-surface text-foreground group-hover:border-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold">{option.title}</h2>
                  <p className="mt-3 max-w-md text-muted">{option.description}</p>
                </div>

                <div className="mt-10 h-1 w-16 rounded-full bg-primary" />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
