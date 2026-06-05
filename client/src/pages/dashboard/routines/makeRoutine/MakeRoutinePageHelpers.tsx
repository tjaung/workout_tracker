import type { RoutineFullCreatePayload } from '@api/programming/routine'
import type { RoutineDraftGoal, RoutineDraftIntensity, RoutineDraftType, SplitDraft } from './types'

export const steps = ['Name', 'Type', 'Goal', 'Splits', 'Intensity', 'Description', 'Start']

export const routineTypes: Array<{ label: string; value: RoutineDraftType; description: string }> = [
  {
    description: 'Strength work, hypertrophy blocks, and traditional gym programming.',
    label: 'Weight training',
    value: 'WEIGHT_TRAINING',
  },
  {
    description: 'Conditioning, heart-rate work, intervals, and endurance sessions.',
    label: 'Cardio',
    value: 'CARDIO',
  },
  {
    description: 'Mobility, flexibility, recovery sessions, and movement quality.',
    label: 'Mobility',
    value: 'MOBILITY',
  },
]

export const routineGoals: Array<{ label: string; value: RoutineDraftGoal; description: string }> = [
  {
    description: 'Higher output and sustainable consistency.',
    label: 'Weight loss',
    value: 'WEIGHT_LOSS',
  },
  {
    description: 'Volume, progression, and muscle-focused training.',
    label: 'Muscle growth',
    value: 'MUSCLE_GROWTH',
  },
  {
    description: 'Heavier work and measurable strength progression.',
    label: 'Strength',
    value: 'STRENGTH',
  },
  {
    description: 'Work capacity, stamina, and repeatable effort.',
    label: 'Endurance',
    value: 'ENDURANCE',
  },
  {
    description: 'Range of motion, control, and recovery.',
    label: 'Flexibility',
    value: 'FLEXIBILITY',
  },
]

export const routineIntensities: Array<{ label: string; value: RoutineDraftIntensity; description: string }> = [
  {
    description: 'Easier sessions, more recovery, and a lower training stress.',
    label: 'Low',
    value: 'LOW',
  },
  {
    description: 'Balanced effort that should be sustainable week to week.',
    label: 'Moderate',
    value: 'MODERATE',
  },
  {
    description: 'Harder sessions with more demanding progression.',
    label: 'High',
    value: 'HIGH',
  },
]

export function buildCreatePayload({
  description,
  goal,
  intensity,
  isGlobal,
  routineName,
  routineType,
  splits,
  startNow,
}: {
  description: string
  goal: RoutineDraftGoal
  intensity: RoutineDraftIntensity
  isGlobal: boolean
  routineName: string
  routineType: RoutineDraftType
  splits: SplitDraft[]
  startNow: boolean
}): RoutineFullCreatePayload {
  return {
    description: description.trim() || null,
    goal: goal || null,
    intensity: intensity || null,
    is_global: isGlobal,
    routine_name: routineName.trim(),
    routine_type: routineType || null,
    splits: splits
      .filter((split) => split.name.trim())
      .map((split, splitIndex) => ({
        exercises: split.exercises.map((selected, exerciseIndex) => ({
          default_distance: parseOptionalNumber(selected.prescription.defaultDistance),
          default_duration_seconds: parseOptionalInteger(selected.prescription.defaultDurationSeconds),
          default_reps: parseOptionalInteger(selected.prescription.defaultReps),
          default_sets: parseOptionalInteger(selected.prescription.defaultSets),
          default_weight_unit: selected.prescription.defaultWeightValue
            ? selected.prescription.defaultWeightUnit
            : null,
          default_weight_value: parseOptionalNumber(selected.prescription.defaultWeightValue),
          exercise_id: selected.exercise.id,
          exercise_order: exerciseIndex + 1,
          notes: selected.prescription.notes.trim() || null,
        })),
        day_of_week: split.dayOfWeek || null,
        split_name: split.name.trim(),
        split_order: splitIndex + 1,
      })),
    start_now: startNow,
  }
}

function parseOptionalInteger(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseOptionalNumber(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}
