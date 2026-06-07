import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit3 } from 'lucide-react'
import {
  recordsApi,
  type ExerciseRecordValueModel,
  type RecordExerciseOptionModel,
} from '@api/records'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { NumberField, SelectField } from '@components/ui/forms'
import { Loading } from '@components/ui/loading'
import { useModal } from '@hooks/modal/useModal'
import { parseOptionalNumber } from '@utils/helpers/helpers'

export function RecordsPage() {
  const { openModal } = useModal()
  const [exercises, setExercises] = useState<RecordExerciseOptionModel[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [records, setRecords] = useState<ExerciseRecordValueModel[]>([])
  const [isLoadingExercises, setIsLoadingExercises] = useState(true)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    setIsLoadingExercises(true)
    recordsApi.exercises()
      .then((options) => {
        setExercises(options)
        setSelectedExerciseId((current) => current || String(options[0]?.exerciseId ?? ''))
      })
      .catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load record exercises')
      })
      .finally(() => setIsLoadingExercises(false))
  }, [])

  useEffect(() => {
    if (!selectedExerciseId) {
      setRecords([])
      return
    }

    setError(null)
    setIsLoadingRecords(true)
    recordsApi.summary(Number(selectedExerciseId))
      .then((summary) => setRecords(summary.records))
      .catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load records')
      })
      .finally(() => setIsLoadingRecords(false))
  }, [selectedExerciseId])

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => String(exercise.exerciseId) === selectedExerciseId) ?? null,
    [exercises, selectedExerciseId],
  )

  const exerciseOptions = exercises.map((exercise) => ({
    label: exercise.name,
    value: String(exercise.exerciseId),
  }))

  const handleManualSave = (nextRecords: ExerciseRecordValueModel[]) => {
    setRecords(nextRecords)
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">Records</p>
              <h1 className="mt-2 text-2xl font-semibold text-foreground">Exercise bests</h1>
            </div>
            <div className="w-full sm:max-w-sm">
              <SelectField
                label="Exercise"
                onChange={setSelectedExerciseId}
                options={exerciseOptions.length > 0 ? exerciseOptions : [{ label: 'No exercises yet', value: '' }]}
                value={selectedExerciseId}
              />
            </div>
          </div>

          {error ? <p className="mb-4 text-sm font-medium text-danger">{error}</p> : null}

          {isLoadingExercises || isLoadingRecords ? (
            <Loading label="Loading records" size="md" />
          ) : selectedExercise ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-surface-muted text-foreground">{selectedExercise.displayType}</Badge>
                {selectedExercise.equipment ? (
                  <Badge className="bg-surface-muted text-foreground">{selectedExercise.equipment}</Badge>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {records.map((record) => (
                  <div
                    key={record.key}
                    className="rounded-lg border border-border bg-surface-muted p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-tertiary">{record.label}</p>
                        <p className="mt-2 text-2xl font-semibold leading-tight text-foreground">{record.displayValue}</p>
                      </div>
                      <Button
                        aria-label={`Edit ${record.label}`}
                        onClick={() => {
                          openModal(
                            <ManualRecordForm
                              exerciseId={selectedExercise.exerciseId}
                              onSave={handleManualSave}
                              record={record}
                            />,
                            { title: `Edit ${record.label}` },
                          )
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-tertiary">
                      {record.isManual ? 'Manual record' : 'Estimated from workout history'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface-muted p-5 text-sm text-tertiary">
              Complete workouts or save routines to start building exercise records.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ManualRecordForm({
  exerciseId,
  onSave,
  record,
}: {
  exerciseId: number
  onSave: (records: ExerciseRecordValueModel[]) => void
  record: ExerciseRecordValueModel
}) {
  const { closeModal } = useModal()
  const [value, setValue] = useState(record.value?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedValue = parseOptionalNumber(value)
    if (parsedValue === null) {
      setError('Enter a record value first.')
      return
    }

    setError(null)
    setIsSaving(true)
    recordsApi.updateManual(exerciseId, {
      records: [{ key: record.key, value: parsedValue }],
    })
      .then((summary) => {
        onSave(summary.records)
        closeModal()
      })
      .catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to save record')
      })
      .finally(() => setIsSaving(false))
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <NumberField
        label={`${record.label} (${record.unit})`}
        onChange={setValue}
        value={value}
      />
      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button onClick={closeModal} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Saving...' : 'Save record'}
        </Button>
      </div>
    </form>
  )
}
