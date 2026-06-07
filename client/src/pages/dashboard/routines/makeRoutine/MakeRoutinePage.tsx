import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routineDetailApi } from '@api/programming/routine'
import { BackButton } from '@components/ui/back-button'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { cn } from '@lib/cn'
import { StartRoutinePrompt } from '@pages/dashboard/routines/StartRoutinePrompt'
import {
  buildCreatePayload,
  routineGoals,
  routineIntensities,
  routineTypes,
  steps,
} from './MakeRoutinePageHelpers'
import { SplitBuilder } from './SplitBuilder'
import type { RoutineDraftGoal, RoutineDraftIntensity, RoutineDraftType, SplitDraft } from './types'

export interface RoutineBuilderInitialDraft {
  description?: string
  goal?: RoutineDraftGoal
  intensity?: RoutineDraftIntensity
  isGlobal?: boolean
  routineName?: string
  routineType?: RoutineDraftType
  splits?: SplitDraft[]
  startNow?: boolean
}

interface MakeRoutinePageProps {
  eyebrow?: string
  initialDraft?: RoutineBuilderInitialDraft
  onCancel?: () => void
  onCreated?: () => void
  title?: string
}

export function MakeRoutinePage(props: MakeRoutinePageProps = {}) {
  const {
    initialDraft,
    onCancel,
    onCreated,
  } = props
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [previousStepIndex, setPreviousStepIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<'back' | 'next'>('next')
  const [isAnimating, setIsAnimating] = useState(false)
  const [routineName, setRoutineName] = useState(initialDraft?.routineName ?? '')
  const [routineType, setRoutineType] = useState<RoutineDraftType>(initialDraft?.routineType ?? '')
  const [goal, setGoal] = useState<RoutineDraftGoal>(initialDraft?.goal ?? '')
  const [intensity, setIntensity] = useState<RoutineDraftIntensity>(initialDraft?.intensity ?? '')
  const [description, setDescription] = useState(initialDraft?.description ?? '')
  const [isGlobal, setIsGlobal] = useState(initialDraft?.isGlobal ?? false)
  const [startNow, setStartNow] = useState(initialDraft?.startNow ?? false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [splits, setSplits] = useState<SplitDraft[]>(initialDraft?.splits ?? [
    {
      dayOfWeek: '',
      exercises: [],
      id: crypto.randomUUID(),
      name: '',
    },
  ])

  const canGoNext = useMemo(() => {
    if (stepIndex === 0) {
      return routineName.trim().length > 0
    }
    if (stepIndex === 1) {
      return routineType.length > 0
    }
    if (stepIndex === 2) {
      return goal.length > 0
    }
    if (stepIndex === 3) {
      return splits.some((split) => split.name.trim().length > 0)
    }
    if (stepIndex === 4) {
      return intensity.length > 0
    }
    return true
  }, [goal, intensity, routineName, routineType, splits, stepIndex])

  const goBack = () => {
    if (isAnimating) {
      return
    }
    setDirection('back')
    setPreviousStepIndex(stepIndex)
    setStepIndex((current) => Math.max(0, current - 1))
    setIsAnimating(true)
    window.setTimeout(() => {
      setPreviousStepIndex(null)
      setIsAnimating(false)
    }, 300)
  }

  const goNext = () => {
    if (isAnimating) {
      return
    }
    setDirection('next')
    setPreviousStepIndex(stepIndex)
    setStepIndex((current) => Math.min(steps.length - 1, current + 1))
    setIsAnimating(true)
    window.setTimeout(() => {
      setPreviousStepIndex(null)
      setIsAnimating(false)
    }, 300)
  }

  const isLastStep = stepIndex === steps.length - 1

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await routineDetailApi.createFull(buildCreatePayload({
        description,
        goal,
        intensity,
        isGlobal,
        routineName,
        routineType,
        splits,
        startNow,
      }))
      if (onCreated) {
        onCreated()
      } else {
        navigate('/dashboard/routines')
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create routine')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <BackButton onClick={onCancel} />

      <Card className="overflow-hidden">
        <CardContent className="flex min-h-[76svh] flex-col p-0">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {steps.map((step, index) => (
                  <span
                    className={cn(
                      'rounded-md border px-3 py-1 text-xs font-medium',
                      index === stepIndex
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted',
                    )}
                    key={step}
                  >
                    {index + 1}. {step}
                  </span>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  checked={isGlobal}
                  className="h-4 w-4 accent-primary"
                  onChange={(event) => setIsGlobal(event.target.checked)}
                  type="checkbox"
                />
                Share with others?
              </label>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {previousStepIndex !== null ? (
              <div
                className={cn(
                  'absolute inset-0 overflow-y-auto p-5 sm:p-8',
                  direction === 'next'
                    ? 'animate-[routine-step-out-left_300ms_ease-in_forwards]'
                    : 'animate-[routine-step-out-right_300ms_ease-in_forwards]',
                )}
              >
                {renderStep({
                  goal,
                  routineName,
                  routineType,
                  setGoal,
                  setDescription,
                  setIntensity,
                  setRoutineName,
                  setRoutineType,
                  setSplits,
                  setStartNow,
                  description,
                  intensity,
                  splits,
                  startNow,
                  stepIndex: previousStepIndex,
                })}
              </div>
            ) : null}

            <div
              className={cn(
                'absolute inset-0 overflow-y-auto p-5 transition-all duration-300 ease-out sm:p-8',
                direction === 'next'
                  ? 'translate-x-0 animate-[routine-step-in-right_300ms_ease-out]'
                  : 'translate-x-0 animate-[routine-step-in-left_300ms_ease-out]',
              )}
              key={stepIndex}
            >
              {renderStep({
                goal,
                description,
                intensity,
                routineName,
                routineType,
                setDescription,
                setGoal,
                setIntensity,
                setRoutineName,
                setRoutineType,
                setSplits,
                setStartNow,
                splits,
                startNow,
                stepIndex,
              })}
            </div>
          </div>

          <footer className="grid items-center gap-3 border-t border-border px-5 py-4 sm:grid-cols-[auto_1fr_auto]">
            <Button
              disabled={(stepIndex === 0 && !onCancel) || isAnimating}
              onClick={stepIndex === 0 && onCancel ? onCancel : goBack}
              variant="secondary"
            >
              <ChevronLeft
                aria-hidden="true"
                className="h-4 w-4"
              />
              {stepIndex === 0 && onCancel ? 'Cancel' : 'Back'}
            </Button>

            {error ? (
              <p className="text-center text-sm text-danger">{error}</p>
            ) : (
              <span />
            )}

            <Button
              className="justify-self-end"
              disabled={!canGoNext || isAnimating || isSubmitting}
              onClick={isLastStep ? handleSubmit : goNext}
            >
              {isLastStep ? (isSubmitting ? 'Creating...' : 'Create routine') : 'Next'}
              {!isLastStep ? (
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              ) : null}
            </Button>
          </footer>
        </CardContent>
      </Card>
    </div>
  )
}

function renderStep({
  description,
  goal,
  intensity,
  routineName,
  routineType,
  setDescription,
  setGoal,
  setIntensity,
  setRoutineName,
  setRoutineType,
  setSplits,
  setStartNow,
  splits,
  startNow,
  stepIndex,
}: {
  description: string
  goal: RoutineDraftGoal
  intensity: RoutineDraftIntensity
  routineName: string
  routineType: RoutineDraftType
  setDescription: (description: string) => void
  setGoal: (goal: RoutineDraftGoal) => void
  setIntensity: (intensity: RoutineDraftIntensity) => void
  setRoutineName: (name: string) => void
  setRoutineType: (routineType: RoutineDraftType) => void
  setSplits: (splits: SplitDraft[]) => void
  setStartNow: (startNow: boolean) => void
  splits: SplitDraft[]
  startNow: boolean
  stepIndex: number
}) {
  if (stepIndex === 0) {
    return (
      <NameStep
        routineName={routineName}
        setRoutineName={setRoutineName}
      />
    )
  }

  if (stepIndex === 1) {
    return (
      <OptionStep
        description="Choose the main training style for this routine."
        options={routineTypes}
        setValue={setRoutineType}
        title="What type of routine is this?"
        value={routineType}
      />
    )
  }

  if (stepIndex === 2) {
    return (
      <OptionStep
        description="Pick the main outcome this routine should support."
        options={routineGoals}
        setValue={setGoal}
        title="What is the goal?"
        value={goal}
      />
    )
  }

  if (stepIndex === 3) {
    return (
      <SplitsStep
        setSplits={setSplits}
        splits={splits}
      />
    )
  }

  if (stepIndex === 4) {
    return (
      <OptionStep
        description="Choose how demanding this routine should feel overall."
        options={routineIntensities}
        setValue={setIntensity}
        title="How intense is this routine?"
        value={intensity}
      />
    )
  }

  if (stepIndex === 5) {
    return (
      <DescriptionStep
        description={description}
        setDescription={setDescription}
      />
    )
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center">
      <StartRoutinePrompt
        setStartNow={setStartNow}
        startNow={startNow}
      />
    </div>
  )
}

function NameStep({
  routineName,
  setRoutineName,
}: {
  routineName: string
  setRoutineName: (name: string) => void
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
        Routine name
      </p>
      <h2 className="mt-2 text-3xl font-semibold">What should we call it?</h2>
      <label className="mt-8 flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
          Name
        </span>
        <Input
          autoFocus
          onChange={(event) => setRoutineName(event.target.value)}
          placeholder="Upper lower strength block"
          value={routineName}
        />
      </label>
    </div>
  )
}

function OptionStep<TValue extends string>({
  description,
  options,
  setValue,
  title,
  value,
}: {
  description: string
  options: Array<{ description: string; label: string; value: TValue }>
  setValue: (value: TValue) => void
  title: string
  value: TValue
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col justify-center">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
        Setup
      </p>
      <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted">{description}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {options.map((option) => (
          <button
            className={cn(
              'min-h-44 cursor-pointer rounded-md border p-5 text-left transition-colors hover:border-primary hover:bg-primary/10',
              value === option.value
                ? 'border-secondary bg-primary text-primary-foreground shadow-md'
                : 'border-border bg-surface',
            )}
            key={option.value}
            onClick={() => setValue(option.value)}
            type="button"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-lg font-semibold">{option.label}</span>
              {value === option.value ? (
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  Selected
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                'mt-3 block text-sm leading-6',
                value === option.value ? 'text-primary-foreground' : 'text-muted',
              )}
            >
              {option.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SplitsStep({
  setSplits,
  splits,
}: {
  setSplits: (splits: SplitDraft[]) => void
  splits: SplitDraft[]
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
        Splits
      </p>
      <h2 className="mt-2 text-3xl font-semibold">Create routine splits</h2>
      <p className="mt-2 text-muted">
        Add the training days that make up this routine, then choose exercises for each split.
      </p>
      <div className="mt-8">
        <SplitBuilder
          onChange={setSplits}
          splits={splits}
        />
      </div>
    </div>
  )
}

function DescriptionStep({
  description,
  setDescription,
}: {
  description: string
  setDescription: (description: string) => void
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
        Description
      </p>
      <h2 className="mt-2 text-3xl font-semibold">Describe the routine</h2>
      <p className="mt-2 text-muted">Add a short note about who this routine is for or how it should be used.</p>
      <label className="mt-8 flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
          Description
        </span>
        <textarea
          className="min-h-40 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="A balanced four-day strength routine..."
          value={description}
        />
      </label>
    </div>
  )
}
