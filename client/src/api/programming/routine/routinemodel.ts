import { formatDate, formatDateOnly } from '@api/model'
import { ExerciseTypeModel } from '@api/exercises/exercise_type'
import type {
  RoutineDetailPayload,
  RoutineGoalPayload,
  RoutineIntensityPayload,
  RoutinePayload,
  RoutineSplitDetailPayload,
  RoutineSplitExerciseDetailPayload,
  RoutineTypePayload,
} from './routineschema'

const routineTypeLabels: Record<RoutineTypePayload, string> = {
  CARDIO: 'Cardio',
  MOBILITY: 'Mobility',
  WEIGHT_TRAINING: 'Weight training',
}

const routineGoalLabels: Record<RoutineGoalPayload, string> = {
  ENDURANCE: 'Endurance',
  FLEXIBILITY: 'Flexibility',
  MUSCLE_GROWTH: 'Muscle growth',
  STRENGTH: 'Strength',
  WEIGHT_LOSS: 'Weight loss',
}

const routineIntensityLabels: Record<RoutineIntensityPayload, string> = {
  HIGH: 'High',
  LOW: 'Low',
  MODERATE: 'Moderate',
}

const dayLabels: Record<string, string> = {
  FRIDAY: 'Friday',
  MONDAY: 'Monday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
  THURSDAY: 'Thursday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
}

export class RoutineModel {
  private readonly payload: RoutinePayload

  constructor(payload: RoutinePayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.routine_id
  }

  get name() {
    return this.payload.routine_name
  }

  get description() {
    return this.payload.description?.trim() || 'No description available yet.'
  }

  get displayCreatedAt() {
    return formatDate(this.payload.created_at)
  }

  get routineType() {
    return this.payload.routine_type ?? null
  }

  get goal() {
    return this.payload.goal ?? null
  }

  get intensity() {
    return this.payload.intensity ?? null
  }

  get displayRoutineType() {
    return this.payload.routine_type ? routineTypeLabels[this.payload.routine_type] : 'Unspecified'
  }

  get displayGoal() {
    return this.payload.goal ? routineGoalLabels[this.payload.goal] : 'Unspecified'
  }

  get displayIntensity() {
    return this.payload.intensity ? routineIntensityLabels[this.payload.intensity] : 'Unspecified'
  }

  get displayStartDate() {
    return formatDateOnly(this.payload.start_date)
  }

  get displayEndDate() {
    return formatDateOnly(this.payload.end_date)
  }

  get displayScope() {
    return this.payload.is_global ? 'Global' : 'Personal'
  }

  get displayStatus() {
    return this.payload.is_active ? 'Active' : 'Inactive'
  }

  get isActive() {
    return this.payload.is_active
  }

  toJSON() {
    return this.payload
  }
}

export class RoutineDetailExerciseModel {
  private readonly payload: RoutineSplitExerciseDetailPayload

  constructor(payload: RoutineSplitExerciseDetailPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.split_exercise_id
  }

  get name() {
    return this.payload.exercise.name
  }

  get exerciseType() {
    return new ExerciseTypeModel(this.payload.exercise.exercise_type)
  }

  get order() {
    return this.payload.exercise_order
  }

  get displayPrescription() {
    const parts: string[] = []
    if (this.payload.default_sets || this.payload.default_reps) {
      parts.push(`${this.payload.default_sets ?? '-'} x ${this.payload.default_reps ?? '-'}`)
    }
    if (this.payload.default_weight_value) {
      const unit = this.payload.default_weight_unit === 'PERCENT_1RM' ? '% 1RM' : this.payload.default_weight_unit
      parts.push(`${this.payload.default_weight_value} ${unit ?? ''}`.trim())
    }
    if (this.payload.default_duration_seconds) {
      parts.push(`${this.payload.default_duration_seconds}s`)
    }
    if (this.payload.default_distance) {
      parts.push(`${this.payload.default_distance} mi`)
    }
    return parts.length > 0 ? parts.join(' - ') : 'No defaults'
  }

  toJSON() {
    return this.payload
  }
}

export class RoutineDetailSplitModel {
  private readonly payload: RoutineSplitDetailPayload

  constructor(payload: RoutineSplitDetailPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.split_id
  }

  get name() {
    return this.payload.split.split_name
  }

  get order() {
    return this.payload.split_order
  }

  get displayOrder() {
    return `Day ${this.payload.split_order}`
  }

  get dayOfWeek() {
    return this.payload.day_of_week ?? null
  }

  get displayDay() {
    return this.payload.day_of_week ? dayLabels[this.payload.day_of_week] ?? this.payload.day_of_week : this.displayOrder
  }

  get exercises() {
    return this.payload.split.split_exercises.map((exercise) => new RoutineDetailExerciseModel(exercise))
  }

  get rawExercises() {
    return this.payload.split.split_exercises
  }

  toJSON() {
    return this.payload
  }
}

export class RoutineDetailModel extends RoutineModel {
  private readonly detailPayload: RoutineDetailPayload

  constructor(payload: RoutineDetailPayload) {
    super(payload)
    this.detailPayload = payload
  }

  get splits() {
    return this.detailPayload.routine_splits.map((split) => new RoutineDetailSplitModel(split))
  }

  get rawSplits() {
    return this.detailPayload.routine_splits
  }

  get daysPerWeek() {
    return this.detailPayload.routine_splits.length
  }

  get displayDaysPerWeek() {
    const days = this.daysPerWeek
    return `${days} ${days === 1 ? 'day' : 'days'}/week`
  }
}
