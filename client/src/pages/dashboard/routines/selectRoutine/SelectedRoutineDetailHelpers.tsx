import { ExerciseModel } from '@api/exercises/exercise'
import type { RoutineDetailModel, RoutineFullCreatePayload } from '@api/programming/routine'
import type { RoutineBuilderInitialDraft } from '@pages/dashboard/routines/addRoutine/RoutineBuilderWizard'
import type { SplitDraft } from '@pages/dashboard/routines/makeRoutine/types'

export function buildPremadePayload(routine: RoutineDetailModel, startNow: boolean): RoutineFullCreatePayload {
  return {
    description: routine.description,
    goal: routine.goal,
    intensity: routine.intensity,
    routine_name: routine.name,
    routine_type: routine.routineType,
    splits: routine.rawSplits.map((split, splitIndex) => ({
      exercises: split.split.split_exercises.map((exercise, exerciseIndex) => ({
        default_distance: exercise.default_distance ?? null,
        default_duration_seconds: exercise.default_duration_seconds ?? null,
        default_reps: exercise.default_reps ?? null,
        default_sets: exercise.default_sets ?? null,
        default_weight_unit: exercise.default_weight_unit ?? null,
        default_weight_value: exercise.default_weight_value ?? null,
        exercise_id: exercise.exercise_id,
        exercise_order: exerciseIndex + 1,
        notes: exercise.notes ?? null,
      })),
      day_of_week: split.day_of_week ?? null,
      split_name: split.split.split_name,
      split_order: splitIndex + 1,
    })),
    is_global: false,
    start_now: startNow,
  }
}

export function routineToBuilderDraft(routine: RoutineDetailModel): RoutineBuilderInitialDraft {
  return {
    description: routine.description,
    goal: routine.goal ?? '',
    intensity: routine.intensity ?? '',
    isGlobal: false,
    routineName: routine.name,
    routineType: routine.routineType ?? '',
    splits: routine.rawSplits.map((split): SplitDraft => ({
      dayOfWeek: (split.day_of_week ?? '') as SplitDraft['dayOfWeek'],
      exercises: split.split.split_exercises.map((exercise) => ({
        draftId: crypto.randomUUID(),
        exercise: new ExerciseModel({
          created_at: new Date().toISOString(),
          created_by_user_id: null,
          equipment: null,
          exercise_id: exercise.exercise_id,
          exercise_type: exercise.exercise.exercise_type,
          execution: null,
          is_global: true,
          name: exercise.exercise.name,
          preparation: null,
        }),
        prescription: {
          defaultDistance: exercise.default_distance?.toString() ?? '',
          defaultDurationSeconds: exercise.default_duration_seconds?.toString() ?? '',
          defaultReps: exercise.default_reps?.toString() ?? '',
          defaultSets: exercise.default_sets?.toString() ?? '',
          defaultWeightUnit: exercise.default_weight_unit ?? 'LB',
          defaultWeightValue: exercise.default_weight_value?.toString() ?? '',
          notes: exercise.notes ?? '',
        },
      })),
      id: crypto.randomUUID(),
      name: split.split.split_name,
    })),
    startNow: false,
  }
}
