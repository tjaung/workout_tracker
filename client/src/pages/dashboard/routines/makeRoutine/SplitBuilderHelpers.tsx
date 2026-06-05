import type { DayOfWeekDraft, ExercisePrescriptionDraft, SplitDraft } from './types'

export const SPLIT_DRAG_TYPE = 'application/workout-tracker-split-index'
export const EXERCISE_DRAG_TYPE = 'application/workout-tracker-exercise-index'

export const dayOptions: Array<{ label: string; value: DayOfWeekDraft }> = [
  { label: 'No day selected', value: '' },
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
  { label: 'Sunday', value: 'SUNDAY' },
]

export const defaultPrescription = (): ExercisePrescriptionDraft => ({
  defaultDistance: '',
  defaultDurationSeconds: '',
  defaultReps: '',
  defaultSets: '',
  defaultWeightUnit: 'LB',
  defaultWeightValue: '',
  notes: '',
})

export function displayPrescription(prescription: ExercisePrescriptionDraft) {
  const parts: string[] = []
  if (prescription.defaultSets || prescription.defaultReps) {
    parts.push(`${prescription.defaultSets || '-'} x ${prescription.defaultReps || '-'}`)
  }
  if (prescription.defaultWeightValue) {
    const unit = prescription.defaultWeightUnit === 'PERCENT_1RM' ? '% 1RM' : prescription.defaultWeightUnit
    parts.push(`${prescription.defaultWeightValue} ${unit}`)
  }
  if (prescription.defaultDurationSeconds) {
    parts.push(`${prescription.defaultDurationSeconds}s`)
  }
  if (prescription.defaultDistance) {
    parts.push(`${prescription.defaultDistance} mi`)
  }
  return parts.length > 0 ? parts.join(' - ') : 'No prescription'
}

export function displaySplitSchedule(split: SplitDraft, splitIndex: number) {
  if (!split.dayOfWeek) {
    return `Day ${splitIndex + 1}`
  }
  return dayOptions.find((option) => option.value === split.dayOfWeek)?.label ?? `Day ${splitIndex + 1}`
}

export function reorder<T>(items: T[], fromIndex: number, toIndex: number) {
  if (!isValidMoveIndex(fromIndex, toIndex, items.length)) {
    return items
  }

  const next = [...items]
  const [movedItem] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, movedItem)
  return next
}

export function isValidMoveIndex(fromIndex: number, toIndex: number, length: number) {
  return (
    Number.isInteger(fromIndex)
    && Number.isInteger(toIndex)
    && fromIndex >= 0
    && toIndex >= 0
    && fromIndex < length
    && toIndex < length
    && fromIndex !== toIndex
  )
}

export function toggleSetValue<T>(current: Set<T>, value: T) {
  const next = new Set(current)
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  return next
}
