import { formatDate, formatDateOnly, formatNumber } from '@api/model'
import type {
  ProgressAggregatePointPayload,
  ProgressBodyMeasurementPointPayload,
  ProgressExercisePointPayload,
  ProgressRecordPointPayload,
  ProgressRoutinePointPayload,
  ProgressSummaryPayload,
  ProgressWorkoutPointPayload,
} from './progressschema'

export class ProgressSummaryModel {
  private readonly payload: ProgressSummaryPayload

  constructor(payload: ProgressSummaryPayload) {
    this.payload = payload
  }

  get activeDays() {
    return this.payload.active_days
  }

  get averageWorkoutDurationMinutes() {
    return this.payload.average_workout_duration_minutes ?? null
  }

  get cumulativeWorkouts() {
    return this.payload.cumulative_workouts
  }

  get recordChanges() {
    return this.payload.record_changes
  }

  get routinesEnded() {
    return this.payload.routines_ended
  }

  get routinesStarted() {
    return this.payload.routines_started
  }

  get weightChangeKg() {
    return this.payload.weight_change_kg ?? null
  }

  get displayAverageWorkoutDuration() {
    return this.averageWorkoutDurationMinutes === null ? 'Not set' : `${this.averageWorkoutDurationMinutes} min`
  }

  get displayWeightChange() {
    if (this.weightChangeKg === null) {
      return 'Not set'
    }
    return `${this.weightChangeKg > 0 ? '+' : ''}${this.weightChangeKg} kg`
  }
}

export class ProgressBodyMeasurementPointModel {
  private readonly payload: ProgressBodyMeasurementPointPayload

  constructor(payload: ProgressBodyMeasurementPointPayload) {
    this.payload = payload
  }

  get bodyFatPercentage() {
    return this.payload.body_fat_percentage ?? null
  }

  get heightCm() {
    return this.payload.height_cm ?? null
  }

  get measuredAt() {
    return this.payload.measured_at
  }

  get weightKg() {
    return this.payload.weight_kg ?? null
  }
}

export class ProgressWorkoutPointModel {
  private readonly payload: ProgressWorkoutPointPayload

  constructor(payload: ProgressWorkoutPointPayload) {
    this.payload = payload
  }

  get dateKey() {
    return this.payload.start_time.slice(0, 10)
  }

  get durationMinutes() {
    return this.payload.duration_minutes ?? null
  }

  get routineId() {
    return this.payload.routine_id ?? null
  }

  get routineName() {
    return this.payload.routine_name ?? 'Custom workout'
  }

  get splitName() {
    return this.payload.split_name ?? 'Open workout'
  }

  get startTime() {
    return this.payload.start_time
  }

  get tooltip() {
    const duration = this.durationMinutes === null ? 'unknown duration' : `${this.durationMinutes} min`
    return `${this.routineName} - ${this.splitName} for ${duration} on ${formatDate(this.startTime)}`
  }
}

export class ProgressRoutinePointModel {
  private readonly payload: ProgressRoutinePointPayload

  constructor(payload: ProgressRoutinePointPayload) {
    this.payload = payload
  }

  get endDate() {
    return this.payload.end_date ?? null
  }

  get id() {
    return this.payload.routine_id
  }

  get isActive() {
    return this.payload.is_active
  }

  get name() {
    return this.payload.routine_name
  }

  get startDate() {
    return this.payload.start_date ?? null
  }

  get displayRange() {
    return `${formatDateOnly(this.startDate)} - ${this.endDate ? formatDateOnly(this.endDate) : 'Now'}`
  }
}

export class ProgressExercisePointModel {
  private readonly payload: ProgressExercisePointPayload

  constructor(payload: ProgressExercisePointPayload) {
    this.payload = payload
  }

  get averageWeight() {
    return this.payload.average_weight ?? null
  }

  get exerciseId() {
    return this.payload.exercise_id
  }

  get exerciseName() {
    return this.payload.exercise_name
  }

  get exerciseType() {
    return this.payload.exercise_type
  }

  get maxDurationSeconds() {
    return this.payload.max_duration_seconds ?? null
  }

  get maxWeight() {
    return this.payload.max_weight ?? null
  }

  get performedAt() {
    return this.payload.performed_at
  }

  get repCount() {
    return this.payload.rep_count
  }

  get setCount() {
    return this.payload.set_count
  }

  get totalDurationSeconds() {
    return this.payload.total_duration_seconds
  }
}

export class ProgressRecordPointModel {
  private readonly payload: ProgressRecordPointPayload

  constructor(payload: ProgressRecordPointPayload) {
    this.payload = payload
  }

  get achievedAt() {
    return this.payload.achieved_at
  }

  get displayValue() {
    return formatNumber(this.payload.value)
  }

  get recordTypeName() {
    return this.payload.record_type_name
  }
}

export class ProgressAggregatePointModel {
  private readonly payload: ProgressAggregatePointPayload

  constructor(payload: ProgressAggregatePointPayload) {
    this.payload = payload
  }

  get periodStart() {
    return this.payload.period_start
  }

  get values() {
    return this.payload.values
  }

  value(key: string) {
    return this.payload.values[key] ?? null
  }
}
