import type { ExerciseModel } from '@api/exercises/exercise'
import type { WeightUnitPayload } from '@api/programming/split_exercise'

export type RoutineDraftType = 'CARDIO' | 'WEIGHT_TRAINING' | 'MOBILITY' | ''
export type RoutineDraftGoal = 'WEIGHT_LOSS' | 'MUSCLE_GROWTH' | 'STRENGTH' | 'ENDURANCE' | 'FLEXIBILITY' | ''
export type RoutineDraftIntensity = 'LOW' | 'MODERATE' | 'HIGH' | ''
export type DayOfWeekDraft = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | ''

export interface ExercisePrescriptionDraft {
  defaultDistance: string
  defaultDurationSeconds: string
  defaultReps: string
  defaultSets: string
  defaultWeightUnit: WeightUnitPayload
  defaultWeightValue: string
  notes: string
}

export interface SelectedExerciseDraft {
  exercise: ExerciseModel
  draftId: string
  prescription: ExercisePrescriptionDraft
}

export interface SplitDraft {
  dayOfWeek: DayOfWeekDraft
  id: string
  name: string
  exercises: SelectedExerciseDraft[]
}
