import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useDrawer } from '@hooks/drawer/useDrawer'
import { cn } from '@lib/cn'
import { ExerciseDrawerContent } from './ExerciseDrawerContent'
import {
  dayOptions,
  defaultPrescription,
  displayPrescription,
  displaySplitSchedule,
  EXERCISE_DRAG_TYPE,
  isValidMoveIndex,
  reorder,
  SPLIT_DRAG_TYPE,
  toggleSetValue,
} from './SplitBuilderHelpers'
import type { DayOfWeekDraft, ExercisePrescriptionDraft, SplitDraft } from './types'

export function SplitBuilder({
  onChange,
  splits,
}: {
  onChange: (splits: SplitDraft[]) => void
  splits: SplitDraft[]
}) {
  const { openDrawer } = useDrawer()
  const [openSplitIds, setOpenSplitIds] = useState(() => new Set(splits.map((split) => split.id)))
  const [openExerciseIds, setOpenExerciseIds] = useState(new Set<string>())

  const updateSplit = (splitId: string, updates: Partial<SplitDraft>) => {
    onChange(splits.map((split) => (split.id === splitId ? { ...split, ...updates } : split)))
  }

  const addSplit = () => {
    const id = crypto.randomUUID()
    onChange([
      ...splits,
      {
        dayOfWeek: '',
        exercises: [],
        id,
        name: '',
      },
    ])
    setOpenSplitIds((current) => new Set(current).add(id))
  }

  const removeSplit = (splitId: string) => {
    onChange(splits.filter((split) => split.id !== splitId))
    setOpenSplitIds((current) => {
      const next = new Set(current)
      next.delete(splitId)
      return next
    })
  }

  const moveSplit = (fromIndex: number, toIndex: number) => {
    onChange(reorder(splits, fromIndex, toIndex))
  }

  const toggleSplit = (splitId: string) => {
    setOpenSplitIds((current) => toggleSetValue(current, splitId))
  }

  const openExerciseDrawer = (split: SplitDraft) => {
    openDrawer(
      <ExerciseDrawerContent
        initialSelected={split.exercises.map((selected) => selected.exercise)}
        onConfirm={(exercises) => {
          const existingByExerciseId = new Map(
            split.exercises.map((selected) => [selected.exercise.id, selected]),
          )
          updateSplit(split.id, {
            exercises: exercises.map((exercise) => {
              const existing = existingByExerciseId.get(exercise.id)
              return {
                draftId: existing?.draftId ?? crypto.randomUUID(),
                exercise,
                prescription: existing?.prescription ?? defaultPrescription(),
              }
            }),
          })
        }}
      />,
      { title: 'Add exercises' },
    )
  }

  return (
    <div className="space-y-3">
      {splits.map((split, splitIndex) => {
        const isOpen = openSplitIds.has(split.id)

        return (
          <div
            className="rounded-md border border-border bg-surface"
            draggable
            key={split.id}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={(event) => {
              event.dataTransfer.setData(SPLIT_DRAG_TYPE, splitIndex.toString())
              event.dataTransfer.effectAllowed = 'move'
            }}
            onDrop={(event) => {
              event.preventDefault()
              const dragValue = event.dataTransfer.getData(SPLIT_DRAG_TYPE)
              if (!dragValue) {
                return
              }
              const fromIndex = Number(dragValue)
              if (isValidMoveIndex(fromIndex, splitIndex, splits.length)) {
                moveSplit(fromIndex, splitIndex)
              }
            }}
          >
            <div className="flex items-center justify-between gap-3 p-3">
              <button
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                onClick={() => toggleSplit(split.id)}
                type="button"
              >
                <GripVertical
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {split.name.trim() || `Split ${splitIndex + 1}`}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {displaySplitSchedule(split, splitIndex)} - {split.exercises.length} exercises
                  </span>
                </span>
              </button>

              <div className="flex items-center gap-2">
                {splits.length > 1 ? (
                  <Button
                    aria-label="Remove split"
                    onClick={() => removeSplit(split.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  </Button>
                ) : null}
                <Button
                  aria-label={isOpen ? 'Collapse split' : 'Expand split'}
                  onClick={() => toggleSplit(split.id)}
                  size="sm"
                  variant="ghost"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')}
                  />
                </Button>
              </div>
            </div>

            {isOpen ? (
              <div className="border-t border-border p-4">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
                    Split name
                  </span>
                  <Input
                    onChange={(event) => updateSplit(split.id, { name: event.target.value })}
                    placeholder="Push day"
                    value={split.name}
                  />
                </label>

                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
                    Day of week
                  </span>
                  <select
                    className="h-10 w-full cursor-pointer rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                    onChange={(event) => updateSplit(split.id, { dayOfWeek: event.target.value as DayOfWeekDraft })}
                    value={split.dayOfWeek}
                  >
                    {dayOptions.map((option) => (
                      <option
                        key={option.value || 'none'}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">Exercises</p>
                    <Button
                      onClick={() => openExerciseDrawer(split)}
                      size="sm"
                      variant="secondary"
                    >
                      <Plus
                        aria-hidden="true"
                        className="h-4 w-4"
                      />
                      Add exercise
                    </Button>
                  </div>

                  <ExerciseList
                    onChange={(exercises) => updateSplit(split.id, { exercises })}
                    openExerciseIds={openExerciseIds}
                    setOpenExerciseIds={setOpenExerciseIds}
                    split={split}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )
      })}

      <Button
        className="w-full"
        onClick={addSplit}
        variant="secondary"
      >
        <Plus
          aria-hidden="true"
          className="h-4 w-4"
        />
        Add split
      </Button>
    </div>
  )
}

function ExerciseList({
  onChange,
  openExerciseIds,
  setOpenExerciseIds,
  split,
}: {
  onChange: (exercises: SplitDraft['exercises']) => void
  openExerciseIds: Set<string>
  setOpenExerciseIds: (updater: (current: Set<string>) => Set<string>) => void
  split: SplitDraft
}) {
  const moveExercise = (fromIndex: number, toIndex: number) => {
    onChange(reorder(split.exercises, fromIndex, toIndex))
  }

  const updatePrescription = (draftId: string, updates: Partial<ExercisePrescriptionDraft>) => {
    onChange(split.exercises.map((selected) => (
      selected.draftId === draftId
        ? { ...selected, prescription: { ...selected.prescription, ...updates } }
        : selected
    )))
  }

  if (split.exercises.length === 0) {
    return (
      <div className="mt-3 rounded-md border border-dashed border-border bg-alabaster-grey p-4">
        <p className="text-sm text-muted">No exercises selected yet.</p>
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {split.exercises.map((selected, exerciseIndex) => {
        const isOpen = openExerciseIds.has(selected.draftId)

        return (
          <div
            className="rounded-md border border-border bg-alabaster-grey"
            draggable
            key={selected.draftId}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={(event) => {
              event.stopPropagation()
              event.dataTransfer.setData(EXERCISE_DRAG_TYPE, exerciseIndex.toString())
              event.dataTransfer.effectAllowed = 'move'
            }}
            onDrop={(event) => {
              event.preventDefault()
              event.stopPropagation()
              const dragValue = event.dataTransfer.getData(EXERCISE_DRAG_TYPE)
              if (!dragValue) {
                return
              }
              const fromIndex = Number(dragValue)
              if (isValidMoveIndex(fromIndex, exerciseIndex, split.exercises.length)) {
                moveExercise(fromIndex, exerciseIndex)
              }
            }}
          >
            <div className="flex items-center justify-between gap-3 p-3">
              <button
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                onClick={() => setOpenExerciseIds((current) => toggleSetValue(current, selected.draftId))}
                type="button"
              >
                <GripVertical
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{selected.exercise.name}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {selected.exercise.exerciseType.displayName} - {displayPrescription(selected.prescription)}
                  </span>
                </span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  aria-label="Remove exercise"
                  onClick={() => onChange(split.exercises.filter((exercise) => exercise.draftId !== selected.draftId))}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </Button>
                <Button
                  aria-label={isOpen ? 'Collapse exercise' : 'Expand exercise'}
                  onClick={() => setOpenExerciseIds((current) => toggleSetValue(current, selected.draftId))}
                  size="sm"
                  variant="ghost"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')}
                  />
                </Button>
              </div>
            </div>

            {isOpen ? (
              <PrescriptionFields
                prescription={selected.prescription}
                onChange={(updates) => updatePrescription(selected.draftId, updates)}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function PrescriptionFields({
  onChange,
  prescription,
}: {
  onChange: (updates: Partial<ExercisePrescriptionDraft>) => void
  prescription: ExercisePrescriptionDraft
}) {
  return (
    <div className="grid gap-3 border-t border-border p-3 sm:grid-cols-2">
      <NumberField
        label="Sets"
        onChange={(value) => onChange({ defaultSets: value })}
        placeholder="3"
        value={prescription.defaultSets}
      />
      <NumberField
        label="Reps"
        onChange={(value) => onChange({ defaultReps: value })}
        placeholder="8"
        value={prescription.defaultReps}
      />
      <NumberField
        label="Weight"
        onChange={(value) => onChange({ defaultWeightValue: value })}
        placeholder="135"
        value={prescription.defaultWeightValue}
      />
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
          Weight unit
        </span>
        <select
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          onChange={(event) => onChange({ defaultWeightUnit: event.target.value as ExercisePrescriptionDraft['defaultWeightUnit'] })}
          value={prescription.defaultWeightUnit}
        >
          <option value="LB">lb</option>
          <option value="KG">kg</option>
          <option value="PERCENT_1RM">% 1RM</option>
        </select>
      </label>
      <NumberField
        label="Duration seconds"
        onChange={(value) => onChange({ defaultDurationSeconds: value })}
        placeholder="900"
        value={prescription.defaultDurationSeconds}
      />
      <NumberField
        label="Distance"
        onChange={(value) => onChange({ defaultDistance: value })}
        placeholder="1.5"
        value={prescription.defaultDistance}
      />
      <label className="flex flex-col gap-2 sm:col-span-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
          Notes
        </span>
        <textarea
          className="min-h-20 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          maxLength={500}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Optional cues or setup notes"
          value={prescription.notes}
        />
      </label>
    </div>
  )
}

function NumberField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
        {label}
      </span>
      <Input
        min="0"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="number"
        value={value}
      />
    </label>
  )
}
