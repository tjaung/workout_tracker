import { Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  currentWorkoutApi,
  type CurrentWorkoutModel,
  type WorkoutHistoryItemModel,
  workoutHistoryApi,
} from '@api/workouts'
import { Button } from '@components/ui/button'
import { Calendar } from '@components/ui/calendar'
import { Card, CardContent } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Filter } from '@components/ui/filter'
import { DateField } from '@components/ui/forms'
import { InfoItem } from '@components/ui/info-item'
import { Loading } from '@components/ui/loading'
import { useModal } from '@hooks/modal/useModal'
import { CumulativeWorkoutsChart } from '@pages/dashboard/workouts/CumulativeWorkoutsChart'
import { startOfMonth } from '@utils/datetime'
import { makeOptions } from '@utils/helpers/helpers'

export function WorkoutsPage() {
  const navigate = useNavigate()
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkoutModel | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutHistoryItemModel[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [routineFilter, setRoutineFilter] = useState('')
  const [splitFilter, setSplitFilter] = useState('')
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([currentWorkoutApi.getCurrent(), workoutHistoryApi.list()])
      .then(([workout, workoutHistory]) => {
        if (isMounted) {
          setCurrentWorkout(workout)
          setWorkouts(workoutHistory)
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load workouts')
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

  const completedDateKeys = useMemo(() => new Set(workouts.map((workout) => workout.startDateKey)), [workouts])

  const routineOptions = useMemo(
    () => makeOptions(workouts.map((workout) => ({ label: workout.routineName, value: workout.routineName })), 'Any routine'),
    [workouts],
  )

  const splitOptions = useMemo(
    () => makeOptions(workouts.map((workout) => ({ label: workout.splitName, value: workout.splitName })), 'Any split'),
    [workouts],
  )

  const filteredWorkouts = useMemo(() => workouts.filter((workout) => {
    const matchesDate = selectedDate ? workout.startDateKey === selectedDate : true
    const matchesStartDate = startDateFilter ? workout.startDateKey >= startDateFilter : true
    const matchesEndDate = endDateFilter ? workout.startDateKey <= endDateFilter : true
    const matchesRoutine = routineFilter ? workout.routineName === routineFilter : true
    const matchesSplit = splitFilter ? workout.splitName === splitFilter : true
    return matchesDate && matchesStartDate && matchesEndDate && matchesRoutine && matchesSplit
  }), [endDateFilter, routineFilter, selectedDate, splitFilter, startDateFilter, workouts])

  if (isLoading) {
    return <Loading fullPage label="Loading workouts" size="lg" />
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

      <CurrentWorkoutCard
        currentWorkout={currentWorkout}
        onAddRoutine={() => navigate('/routines/add-routine')}
      />

      <CurrentWorkoutActions currentWorkout={currentWorkout} />

      <section className="flex flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
          Past workouts
        </p>

        <section className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
          <Calendar
            eventDateKeys={completedDateKeys}
            monthCursor={monthCursor}
            onChangeMonth={setMonthCursor}
            onSelectDate={(dateKey) => setSelectedDate((current) => (current === dateKey ? null : dateKey))}
            selectedDate={selectedDate}
          />

          <Card>
            <CardContent className="p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
                <Filter
                  label="Routine"
                  onChange={setRoutineFilter}
                  options={routineOptions}
                  value={routineFilter}
                />
                <Filter
                  label="Split"
                  onChange={setSplitFilter}
                  options={splitOptions}
                  value={splitFilter}
                />
                <DateField
                  label="Start date"
                  onChange={setStartDateFilter}
                  value={startDateFilter}
                />
                <DateField
                  label="End date"
                  onChange={setEndDateFilter}
                  value={endDateFilter}
                />
                <Button
                  onClick={() => {
                    setSelectedDate(null)
                    setStartDateFilter('')
                    setEndDateFilter('')
                    setRoutineFilter('')
                    setSplitFilter('')
                  }}
                  variant="secondary"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <CumulativeWorkoutsChart workouts={filteredWorkouts} />

        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted">No completed workouts match those filters.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

export function CurrentWorkoutCard({
  currentWorkout,
  onAddRoutine,
}: {
  currentWorkout: CurrentWorkoutModel | null
  onAddRoutine: () => void
}) {
  if (!currentWorkout || !currentWorkout.hasWorkout) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
            Current workout
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            {currentWorkout?.displayState ?? 'No workout found'}
          </h1>
          <p className="mt-3 text-muted">
            Start an active routine to see the next workout in your schedule.
          </p>
          <Button className="mt-5" onClick={onAddRoutine}>
            Add routine
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
              Current workout
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{currentWorkout.splitName}</h1>
            <p className="mt-2 text-muted">{currentWorkout.routineName}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
            <Badge>{currentWorkout.displayState}</Badge>
            <Badge>{currentWorkout.displayDay}</Badge>
            <Badge>{currentWorkout.displayScheduledDate}</Badge>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-tertiary">
            Exercises
          </h2>
          <div className="mt-3 space-y-2">
            {currentWorkout.exercises.length > 0 ? (
              currentWorkout.exercises.map((exercise) => (
                <div
                  className="flex flex-col gap-1 rounded-md bg-alabaster-grey p-3 sm:flex-row sm:items-center sm:justify-between"
                  key={`${exercise.id}-${exercise.order}`}
                >
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-sm font-medium text-muted">{exercise.displayPrescription}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No exercises are attached to this split.</p>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

export function CurrentWorkoutActions({ currentWorkout }: { currentWorkout: CurrentWorkoutModel | null }) {
  const navigate = useNavigate()

  if (currentWorkout?.isInProgress) {
    return (
      <Button
        onClick={() => navigate('/workouts/current-workout?source=continue')}
        size="lg"
      >
        Continue current workout
      </Button>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        disabled={!currentWorkout?.hasWorkout}
        onClick={() => navigate('/workouts/current-workout?source=current')}
        size="lg"
      >
        Start current workout
      </Button>
      <Button
        onClick={() => navigate('/workouts/current-workout?source=empty')}
        size="lg"
        variant="secondary"
      >
        Start empty workout
      </Button>
    </div>
  )
}

function WorkoutCard({ workout }: { workout: WorkoutHistoryItemModel }) {
  const { openModal } = useModal()

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
              {workout.status.displayName}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{workout.splitName}</h2>
            <p className="mt-2 text-muted">{workout.routineName}</p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-wrap justify-end gap-2 text-xs font-medium text-muted">
              <span className="rounded-md border border-border px-2 py-1">{workout.exerciseCount} exercises</span>
              <span className="rounded-md border border-border px-2 py-1">{workout.setCount} sets</span>
            </div>
            <Button
              aria-label={`View details for ${workout.splitName}`}
              onClick={() => openModal(<WorkoutDetailsModal workout={workout} />, { title: workout.splitName })}
              size="sm"
              variant="outline"
            >
              <Info aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoItem label="Started" value={workout.displayStartDate} />
          <InfoItem label="Ended" value={workout.displayEndDate} />
        </dl>
      </CardContent>
    </Card>
  )
}

function WorkoutDetailsModal({ workout }: { workout: WorkoutHistoryItemModel }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <InfoItem label="Started" value={workout.displayStartDate} />
        <InfoItem label="Ended" value={workout.displayEndDate} />
      </dl>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
        <Badge className="bg-transparent">{workout.status.displayName}</Badge>
        <Badge className="bg-transparent">{workout.exerciseCount} exercises</Badge>
        <Badge className="bg-transparent">{workout.setCount} sets</Badge>
      </div>

      <div className="space-y-3">
        {workout.exercises.length > 0 ? (
          workout.exercises.map((exercise) => (
            <details
              className="rounded-md border border-border bg-alabaster-grey"
              key={exercise.id}
            >
              <summary className="cursor-pointer px-4 py-3 font-medium">
                <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>{exercise.name}</span>
                  <span className="w-fit rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-muted">
                    {exercise.status.displayName}
                  </span>
                </span>
              </summary>
              <div className="border-t border-border px-4 py-3">
                {exercise.sets.length > 0 ? (
                  <div className="space-y-2">
                    {exercise.sets.map((set) => (
                      <div
                        className="flex flex-col gap-1 rounded-md bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
                        key={set.id}
                      >
                        <p className="font-medium">Set {set.setNumber}</p>
                        <p className="text-sm font-medium text-muted">{set.displayResult}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No sets logged.</p>
                )}
              </div>
            </details>
          ))
        ) : (
          <p className="text-sm text-muted">No exercises logged.</p>
        )}
      </div>
    </div>
  )
}
