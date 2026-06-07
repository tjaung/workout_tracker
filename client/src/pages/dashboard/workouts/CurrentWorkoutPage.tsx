import { Ban, Check, Info, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { type ExerciseModel } from '@api/exercises/exercise'
import { userSettingsApi } from '@api/users'
import {
  currentWorkoutApi,
  type CompleteWorkoutPayload,
  type CurrentWorkoutExerciseModel,
  type CurrentWorkoutModel,
} from '@api/workouts'
import type { SessionExerciseStatusPayload } from '@api/workouts/session_exercise_status'
import { BackButton } from '@components/ui/back-button'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { DetailBlock } from '@components/ui/detail-block'
import { NumberField, TextField } from '@components/ui/forms'
import { Loading } from '@components/ui/loading'
import { useDrawer } from '@hooks/drawer/useDrawer'
import { useModal } from '@hooks/modal/useModal'
import { ExerciseDrawerContent } from '@pages/dashboard/routines/makeRoutine/ExerciseDrawerContent'
import { formatTimer } from '@utils/datetime'
import { createId, parseOptionalInteger, parseOptionalNumber } from '@utils/helpers/helpers'

type WorkoutExerciseDraft = {
  draftId: string
  equipment: string | null
  exerciseId: number
  exerciseType: string
  execution: string | null
  isAdditional: boolean
  name: string
  order: number
  preparation: string | null
  sets: WorkoutSetDraft[]
  sourceSplitExerciseId: number | null
  status: SessionExerciseStatusPayload
}

type WorkoutSetDraft = {
  distance: string
  durationSeconds: string
  intensity: string
  notes: string
  reps: string
  setId: string
  weight: string
}

export function CurrentWorkoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const source = parseWorkoutSource(searchParams.get('source'))
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkoutModel | null>(null)
  const [exercises, setExercises] = useState<WorkoutExerciseDraft[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [restTimerSeconds, setRestTimerSeconds] = useState(90)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null)
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0)
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number | null>(null)
  const { openDrawer } = useDrawer()
  const { closeModal, openModal } = useModal()

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    const request = source === 'continue'
      ? currentWorkoutApi.getCurrent()
      : currentWorkoutApi.start({ source })

    request
      .then((workout) => {
        if (isMounted) {
          setCurrentWorkout(workout)
          setExercises(workout.exercises.map(exerciseToDraft))
          setWorkoutStartedAt(Date.now())
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load current workout')
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
  }, [source])

  useEffect(() => {
    let isMounted = true

    userSettingsApi
      .get()
      .then((settings) => {
        if (isMounted) {
          setRestTimerSeconds(settings.workoutRestTimerSeconds)
        }
      })
      .catch(() => {
        if (isMounted) {
          setRestTimerSeconds(90)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (workoutStartedAt === null) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setWorkoutElapsedSeconds(Math.max(0, Math.floor((Date.now() - workoutStartedAt) / 1000)))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [workoutStartedAt])

  useEffect(() => {
    if (restSecondsRemaining === null) {
      return undefined
    }

    if (restSecondsRemaining <= 0) {
      setRestSecondsRemaining(null)
      openModal(
        <RestTimerCompleteModal onClose={closeModal} />,
        { title: 'Rest time is over' },
      )
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setRestSecondsRemaining((current) => (current === null ? null : current - 1))
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [closeModal, openModal, restSecondsRemaining])

  const completedExerciseCount = exercises.filter((exercise) => exercise.status === 'COMPLETED').length
  const partialExerciseCount = exercises.filter((exercise) => exercise.status === 'PARTIAL').length
  const skippedExerciseCount = exercises.filter((exercise) => exercise.status === 'SKIPPED').length

  const addSet = (draftId: string) => {
    setExercises((current) => current.map((exercise) => (
      exercise.draftId === draftId
        ? { ...exercise, sets: [...exercise.sets, emptySetDraft()] }
        : exercise
    )))
  }

  const updateSet = (
    draftId: string,
    setId: string,
    updates: Partial<WorkoutSetDraft>,
  ) => {
    setExercises((current) => current.map((exercise) => (
      exercise.draftId === draftId
        ? {
          ...exercise,
          sets: exercise.sets.map((set) => (
            set.setId === setId ? { ...set, ...updates } : set
          )),
        }
        : exercise
    )))
  }

  const removeSet = (draftId: string, setId: string) => {
    setExercises((current) => current.map((exercise) => (
      exercise.draftId === draftId
        ? { ...exercise, sets: exercise.sets.filter((set) => set.setId !== setId) }
        : exercise
    )))
  }

  const openExerciseInfo = (exercise: WorkoutExerciseDraft) => {
    openDrawer(<ExerciseInfo exercise={exercise} />, { title: exercise.name })
  }

  const openAddExerciseDrawer = () => {
    openDrawer(
      <ExerciseDrawerContent
        initialSelected={[]}
        onConfirm={(selectedExercises) => {
          setExercises((current) => [
            ...current,
            ...selectedExercises
              .filter((exercise) => !current.some((draft) => draft.exerciseId === exercise.id))
              .map((exercise, index) => exerciseModelToDraft(exercise, current.length + index + 1)),
          ])
        }}
      />,
      { title: 'Add exercises' },
    )
  }

  const updateExerciseStatus = (draftId: string, status: SessionExerciseStatusPayload) => {
    setExercises((current) => current.map((exercise) => (
      exercise.draftId === draftId ? { ...exercise, status } : exercise
    )))
  }

  const completeWorkout = async () => {
    if (!currentWorkout?.workoutSessionId) {
      setError('No workout session is available to complete')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await currentWorkoutApi.complete(currentWorkout.workoutSessionId, buildCompletePayload(exercises))
      navigate('/dashboard/workouts')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to complete workout')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <Loading fullPage label="Loading workout" size="lg" />
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <BackButton />

      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
                Workout
              </p>
              <h1 className="mt-2 text-2xl font-semibold">
                {currentWorkout?.hasWorkout ? currentWorkout.splitName : 'Empty workout'}
              </h1>
              <p className="mt-2 text-muted">
                {currentWorkout?.hasWorkout ? currentWorkout.routineName : 'Add exercises as you train.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
              <Badge>{source === 'empty' ? 'Empty' : 'In progress'}</Badge>
              <Badge>Workout {formatTimer(workoutElapsedSeconds)}</Badge>
              <Badge>{exercises.length} exercises</Badge>
              <Badge>{completedExerciseCount} complete</Badge>
              <Badge>{partialExerciseCount} partial</Badge>
              <Badge>{skippedExerciseCount} skipped</Badge>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-muted">
              {restSecondsRemaining === null
                ? `Rest timer ready: ${formatTimer(restTimerSeconds)}`
                : `Rest remaining: ${formatTimer(restSecondsRemaining)}`}
            </p>
            <Button onClick={() => setRestSecondsRemaining(restTimerSeconds)} variant="outline">
              Start rest timer
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        {exercises.map((exercise) => (
          <WorkoutExerciseCard
            exercise={exercise}
            key={exercise.draftId}
            onAddSet={() => addSet(exercise.draftId)}
            onInfo={() => openExerciseInfo(exercise)}
            onRemoveSet={(setId) => removeSet(exercise.draftId, setId)}
            onStatusChange={(status) => updateExerciseStatus(exercise.draftId, status)}
            onUpdateSet={(setId, updates) => updateSet(exercise.draftId, setId, updates)}
          />
        ))}

        <Button
          className="w-full"
          onClick={openAddExerciseDrawer}
          variant="secondary"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add exercise
        </Button>
      </section>

      <Button
        disabled={isSubmitting || !currentWorkout?.workoutSessionId}
        onClick={completeWorkout}
        size="lg"
      >
        {isSubmitting ? 'Completing...' : 'Complete workout'}
      </Button>
    </div>
  )
}

function RestTimerCompleteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-5">
      <p className="text-muted">
        Rest time is over. Start the next set when you are ready.
      </p>
      <div className="flex justify-end">
        <Button onClick={onClose}>Got it</Button>
      </div>
    </div>
  )
}

function WorkoutExerciseCard({
  exercise,
  onAddSet,
  onInfo,
  onRemoveSet,
  onStatusChange,
  onUpdateSet,
}: {
  exercise: WorkoutExerciseDraft
  onAddSet: () => void
  onInfo: () => void
  onRemoveSet: (setId: string) => void
  onStatusChange: (status: SessionExerciseStatusPayload) => void
  onUpdateSet: (setId: string, updates: Partial<WorkoutSetDraft>) => void
}) {
  const isCollapsed = exercise.status === 'COMPLETED' || exercise.status === 'SKIPPED'

  return (
    <Card className={getExerciseStatusClassName(exercise.status)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{exercise.name}</h2>
              {exercise.isAdditional ? <Badge>Additional</Badge> : null}
              <Badge>{formatExerciseStatus(exercise.status)}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{formatExerciseType(exercise.exerciseType)}</p>
          </div>
          <Button
            aria-label="Exercise info"
            onClick={onInfo}
            size="sm"
            variant="secondary"
          >
            <Info aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>

        {!isCollapsed ? (
          <>
            <div className="mt-5 space-y-3">
              {exercise.sets.map((set, index) => (
                <SetRow
                  exerciseType={exercise.exerciseType}
                  key={set.setId}
                  onChange={(updates) => onUpdateSet(set.setId, updates)}
                  onRemove={() => onRemoveSet(set.setId)}
                  set={set}
                  setNumber={index + 1}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={onAddSet} variant="secondary">
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add set
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => onStatusChange('SKIPPED')} variant="secondary">
                  <Ban aria-hidden="true" className="h-4 w-4" />
                  Skip exercise
                </Button>
                <Button onClick={() => onStatusChange('COMPLETED')}>
                  <Check aria-hidden="true" className="h-4 w-4" />
                  Complete exercise
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 flex justify-end">
            <Button onClick={() => onStatusChange('PARTIAL')} variant="secondary">
              Edit exercise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SetRow({
  exerciseType,
  onChange,
  onRemove,
  set,
  setNumber,
}: {
  exerciseType: string
  onChange: (updates: Partial<WorkoutSetDraft>) => void
  onRemove: () => void
  set: WorkoutSetDraft
  setNumber: number
}) {
  const mode = getInputMode(exerciseType)

  return (
    <div className="grid gap-3 rounded-md border border-border bg-alabaster-grey p-3 md:grid-cols-[auto_1fr_auto] md:items-end">
      <p className="text-sm font-semibold">Set {setNumber}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {mode === 'strength' ? (
          <>
            <NumberField label="Reps" onChange={(value) => onChange({ reps: value })} value={set.reps} />
            <NumberField label="Weight" onChange={(value) => onChange({ weight: value })} value={set.weight} />
          </>
        ) : null}
        {mode === 'cardio' ? (
          <>
            <NumberField label="Duration sec" onChange={(value) => onChange({ durationSeconds: value })} value={set.durationSeconds} />
            <NumberField label="Distance" onChange={(value) => onChange({ distance: value })} value={set.distance} />
          </>
        ) : null}
        {mode === 'mobility' ? (
          <>
            <NumberField label="Duration sec" onChange={(value) => onChange({ durationSeconds: value })} value={set.durationSeconds} />
            <TextField label="Intensity" onChange={(value) => onChange({ intensity: value })} value={set.intensity} />
          </>
        ) : null}
        <TextField label="Notes" onChange={(value) => onChange({ notes: value })} value={set.notes} />
      </div>
      <Button aria-label="Remove set" onClick={onRemove} size="sm" variant="ghost">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </Button>
    </div>
  )
}

function ExerciseInfo({ exercise }: { exercise: WorkoutExerciseDraft }) {
  return (
    <div className="space-y-5 pt-5 text-sm text-muted">
      <DetailBlock as="section" label="Type" value={formatExerciseType(exercise.exerciseType)} />
      <DetailBlock as="section" label="Equipment" value={exercise.equipment} />
      <DetailBlock as="section" label="Preparation" value={exercise.preparation} />
      <DetailBlock as="section" label="Execution" value={exercise.execution} />
    </div>
  )
}

function exerciseToDraft(exercise: CurrentWorkoutExerciseModel): WorkoutExerciseDraft {
  const setCount = exercise.defaultSets ?? 1
  return {
    draftId: createId(),
    equipment: exercise.equipment ?? null,
    exerciseId: exercise.id,
    exerciseType: exercise.exerciseTypeValue,
    execution: exercise.execution ?? null,
    isAdditional: exercise.sourceSplitExerciseId === null,
    name: exercise.name,
    order: exercise.order,
    preparation: exercise.preparation ?? null,
    sets: Array.from({ length: setCount }, () => suggestedSetDraft(exercise)),
    sourceSplitExerciseId: exercise.sourceSplitExerciseId,
    status: exercise.status,
  }
}

function exerciseModelToDraft(exercise: ExerciseModel, order: number): WorkoutExerciseDraft {
  return {
    draftId: createId(),
    equipment: exercise.equipment ?? null,
    exerciseId: exercise.id,
    exerciseType: exercise.exerciseTypeValue,
    execution: exercise.execution ?? null,
    isAdditional: true,
    name: exercise.name,
    order,
    preparation: exercise.preparation ?? null,
    sets: [emptySetDraft()],
    sourceSplitExerciseId: null,
    status: 'PARTIAL',
  }
}

function suggestedSetDraft(exercise: CurrentWorkoutExerciseModel): WorkoutSetDraft {
  return {
    distance: exercise.defaultDistance?.toString() ?? '',
    durationSeconds: exercise.defaultDurationSeconds?.toString() ?? '',
    intensity: '',
    notes: '',
    reps: exercise.defaultReps?.toString() ?? '',
    setId: createId(),
    weight: exercise.defaultWeightValue?.toString() ?? '',
  }
}

function emptySetDraft(): WorkoutSetDraft {
  return {
    distance: '',
    durationSeconds: '',
    intensity: '',
    notes: '',
    reps: '',
    setId: createId(),
    weight: '',
  }
}

function buildCompletePayload(exercises: WorkoutExerciseDraft[]): CompleteWorkoutPayload {
  return {
    exercises: exercises.map((exercise, exerciseIndex) => ({
      exercise_id: exercise.exerciseId,
      exercise_order: exerciseIndex + 1,
      notes: null,
      source_split_exercise_id: exercise.sourceSplitExerciseId,
      status: exercise.status,
      sets: exercise.status === 'SKIPPED' ? [] : exercise.sets.map((set, setIndex) => ({
        distance: parseOptionalNumber(set.distance),
        duration_seconds: parseOptionalInteger(set.durationSeconds),
        intensity: set.intensity.trim() || null,
        notes: set.notes.trim() || null,
        reps: parseOptionalInteger(set.reps),
        set_number: setIndex + 1,
        weight: parseOptionalNumber(set.weight),
      })),
    })),
    notes: null,
  }
}

function getInputMode(exerciseType: string) {
  if (exerciseType === 'CARDIO') {
    return 'cardio'
  }
  if (exerciseType === 'MOBILITY') {
    return 'mobility'
  }
  return 'strength'
}

function formatExerciseType(exerciseType: string) {
  return exerciseType.replaceAll('_', ' ').toLowerCase()
}

function formatExerciseStatus(status: SessionExerciseStatusPayload) {
  return status.replaceAll('_', ' ').toLowerCase()
}

function getExerciseStatusClassName(status: SessionExerciseStatusPayload) {
  if (status === 'COMPLETED') {
    return 'border-primary bg-primary/10'
  }
  if (status === 'SKIPPED') {
    return 'border-tertiary bg-dust-grey/60'
  }
  return ''
}

function parseWorkoutSource(value: string | null): 'continue' | 'current' | 'empty' {
  if (value === 'current' || value === 'empty') {
    return value
  }
  return 'continue'
}
