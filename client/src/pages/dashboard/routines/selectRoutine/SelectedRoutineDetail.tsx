import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routineDetailApi, type RoutineDetailModel } from '@api/programming/routine'
import { BackButton } from '@components/ui/back-button'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { useModal } from '@hooks/modal/useModal'
import { StartRoutinePrompt } from '@pages/dashboard/routines/StartRoutinePrompt'
import type { RoutineBuilderInitialDraft } from '@pages/dashboard/routines/addRoutine/RoutineBuilderWizard'
import { buildPremadePayload, routineToBuilderDraft } from './SelectedRoutineDetailHelpers'

export function SelectedRoutineDetail({
  onEdit,
  onBack,
  routine,
}: {
  onEdit: (draft: RoutineBuilderInitialDraft) => void
  onBack: () => void
  routine: RoutineDetailModel
}) {
  const { openModal } = useModal()

  const openStartPrompt = () => {
    openModal(
      <StartRoutineModalContent
        routine={routine}
      />,
      { title: 'Pick this routine' },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BackButton onClick={onBack} />
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(routineToBuilderDraft(routine))}
            variant="secondary"
          >
            Edit routine
          </Button>
          <Button onClick={openStartPrompt}>Pick this routine</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
            <InfoPill>{routine.displayRoutineType}</InfoPill>
            <InfoPill>{routine.displayGoal}</InfoPill>
            <InfoPill>{routine.displayDaysPerWeek}</InfoPill>
            <InfoPill>{routine.displayIntensity}</InfoPill>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-tertiary">
              Description
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{routine.description}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-tertiary">
              Splits
            </h2>
            <div className="mt-3 space-y-3">
              {routine.splits.map((split) => (
                <div
                  className="rounded-md border border-border bg-alabaster-grey p-4"
                  key={split.id}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium">{split.name}</p>
                    <p className="text-sm text-muted">{split.displayDay}</p>
                  </div>
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
                </div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>

      <footer className="flex items-center justify-between gap-3">
        <Button
          onClick={onBack}
          variant="secondary"
        >
          Back
        </Button>
      </footer>
    </div>
  )
}

function StartRoutineModalContent({
  routine,
}: {
  routine: RoutineDetailModel
}) {
  const navigate = useNavigate()
  const { closeModal } = useModal()
  const [modalStartNow, setModalStartNow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createRoutine = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await routineDetailApi.createFull(buildPremadePayload(routine, modalStartNow))
      closeModal()
      navigate('/dashboard/routines')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create routine')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <StartRoutinePrompt
        setStartNow={setModalStartNow}
        startNow={modalStartNow}
      />
      <div className="flex items-center justify-between gap-3">
        {error ? <p className="text-sm text-danger">{error}</p> : <span />}
        <Button
          disabled={isSubmitting}
          onClick={createRoutine}
        >
          {isSubmitting ? 'Creating...' : "Let's go!"}
        </Button>
      </div>
    </div>
  )
}

function InfoPill({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-border bg-alabaster-grey px-2 py-1">
      {children}
    </span>
  )
}
