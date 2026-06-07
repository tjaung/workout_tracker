import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routineDetailApi, type RoutineDetailModel } from '@api/programming/routine'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { InfoItem } from '@components/ui/info-item'
import { Loading } from '@components/ui/loading'
import { useModal } from '@hooks/modal/useModal'

export function RoutinesPage() {
  const navigate = useNavigate()
  const [activeRoutine, setActiveRoutine] = useState<RoutineDetailModel | null>(null)
  const [routines, setRoutines] = useState<RoutineDetailModel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([routineDetailApi.getActive(), routineDetailApi.listMine()])
      .then(([active, routineList]) => {
        if (isMounted) {
          setActiveRoutine(active)
          setRoutines(routineList)
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load routines')
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

  if (isLoading) {
    return <Loading fullPage label="Loading routines" size="lg" />
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <RoutineCard
        emptyText="No active routine yet."
        eyebrow="Active routine"
        routine={activeRoutine}
      />

      <div>
        <Button size="lg" onClick={() => navigate('/routines/add-routine')}>
          Add new routine
        </Button>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
            My routines
          </p>
        </div>

        {routines.length > 0 ? (
          routines.map((routine) => (
            <RoutineCard
              emptyText="No routine details available."
              eyebrow={routine.displayStatus}
              key={routine.id}
              routine={routine}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted">No personal routines found.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

function RoutineCard({
  emptyText,
  eyebrow,
  routine,
}: {
  emptyText: string
  eyebrow: string
  routine: RoutineDetailModel | null
}) {
  const { openModal } = useModal()

  if (!routine) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">{eyebrow}</p>
          <p className="mt-3 text-muted">{emptyText}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{routine.name}</h2>
            <p className="mt-2 text-sm text-muted">
              {routine.displayDaysPerWeek} · {routine.splits.length} splits
            </p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-wrap justify-end gap-2 text-xs font-medium text-muted">
              <Badge className="bg-transparent">{routine.displayScope}</Badge>
              <Badge className="bg-transparent">{routine.displayStatus}</Badge>
            </div>
            <Button
              aria-label={`View details for ${routine.name}`}
              onClick={() => openModal(<RoutineDetailsModal routine={routine} />, { title: routine.name })}
              size="sm"
              variant="outline"
            >
              <Info aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <InfoItem label="Start" value={routine.displayStartDate} />
          <InfoItem label="End" value={routine.displayEndDate} />
          <InfoItem label="Created" value={routine.displayCreatedAt} />
        </dl>
      </CardContent>
    </Card>
  )
}

function RoutineDetailsModal({ routine }: { routine: RoutineDetailModel }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-3">
        <InfoItem label="Start" value={routine.displayStartDate} />
        <InfoItem label="End" value={routine.displayEndDate} />
        <InfoItem label="Created" value={routine.displayCreatedAt} />
      </dl>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
        <Badge className="bg-transparent">{routine.displayScope}</Badge>
        <Badge className="bg-transparent">{routine.displayStatus}</Badge>
        <Badge className="bg-transparent">{routine.displayDaysPerWeek}</Badge>
      </div>

      <div className="space-y-3">
        {routine.splits.length > 0 ? (
          routine.splits.map((split) => (
            <details
              className="rounded-md border border-border bg-alabaster-grey"
              key={`${routine.id}-${split.id}`}
            >
              <summary className="cursor-pointer px-4 py-3 font-medium">
                {split.displayDay}: {split.name}
              </summary>
              <div className="border-t border-border px-4 py-3">
                {split.exercises.length > 0 ? (
                  <div className="space-y-2">
                    {split.exercises.map((exercise) => (
                      <div
                        className="flex flex-col gap-1 rounded-md bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
                        key={exercise.id}
                      >
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted">{exercise.exerciseType.displayName}</p>
                        </div>
                        <p className="text-sm font-medium text-muted">{exercise.displayPrescription}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No exercises added.</p>
                )}
              </div>
            </details>
          ))
        ) : (
          <p className="text-sm text-muted">No splits added.</p>
        )}
      </div>
    </div>
  )
}
