import type { RoutineDetailModel } from '@api/programming/routine'
import { Accordion } from '@components/ui/accordion'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'

export function RoutineSelectCard({
  onSelect,
  routine,
}: {
  onSelect?: () => void
  routine: RoutineDetailModel
}) {
  return (
    <Card className="overflow-hidden transition-colors hover:border-primary">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-tertiary">
              {routine.displayScope}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{routine.name}</h2>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
            <Badge>{routine.displayRoutineType}</Badge>
            <Badge>{routine.displayGoal}</Badge>
            <Badge>{routine.displayDaysPerWeek}</Badge>
            <Badge>{routine.displayIntensity}</Badge>
          </div>
        </div>
      </CardContent>

      <Accordion title="View routine details">
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-tertiary">
              Description
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">{routine.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-tertiary">
              Splits
            </h3>
            <div className="mt-3 space-y-3">
              {routine.splits.length > 0 ? (
                routine.splits.map((split) => (
                  <div
                    className="rounded-md border border-border bg-alabaster-grey p-4"
                    key={`${routine.id}-${split.id}`}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium">{split.name}</p>
                      <p className="text-sm text-muted">{split.displayDay}</p>
                    </div>

                    {split.exercises.length > 0 ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {split.exercises.map((exercise) => (
                          <div
                            className="rounded-md bg-surface p-3"
                            key={exercise.id}
                          >
                            <p className="text-sm font-medium">{exercise.name}</p>
                            <p className="mt-1 text-xs text-muted">
                              {exercise.exerciseType.displayName} - {exercise.displayPrescription}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted">No exercises added.</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No splits added.</p>
              )}
            </div>
          </div>
        </div>
      </Accordion>

      {onSelect ? (
        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button onClick={onSelect}>Select</Button>
        </div>
      ) : null}
    </Card>
  )
}
