import { formatDate } from '@api/model'
import { SessionExerciseStatusModel } from '@api/workouts/session_exercise_status'
import { WorkoutStatusModel } from '@api/workouts/workout_status'
import type {
  CurrentWorkoutExercisePayload,
  CurrentWorkoutPayload,
  WorkoutHistoryExercisePayload,
  WorkoutHistoryItemPayload,
  WorkoutHistorySetPayload,
  WorkoutSessionPayload,
} from './workoutsessionschema'

const dayLabels: Record<string, string> = {
  FRIDAY: 'Friday',
  MONDAY: 'Monday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
  THURSDAY: 'Thursday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
}

export class WorkoutSessionModel {
  private readonly payload: WorkoutSessionPayload

  constructor(payload: WorkoutSessionPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.workout_session_id
  }

  get userId() {
    return this.payload.user_id
  }

  get status() {
    return new WorkoutStatusModel(this.payload.status)
  }

  get displayStartTime() {
    return formatDate(this.payload.start_time)
  }

  get displayEndTime() {
    return formatDate(this.payload.end_time)
  }

  toJSON() {
    return this.payload
  }
}

export class CurrentWorkoutExerciseModel {
  private readonly payload: CurrentWorkoutExercisePayload

  constructor(payload: CurrentWorkoutExercisePayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.exercise_id
  }

  get sourceSplitExerciseId() {
    return this.payload.source_split_exercise_id ?? null
  }

  get name() {
    return this.payload.name
  }

  get exerciseTypeValue() {
    return this.payload.exercise_type ?? 'OTHER'
  }

  get equipment() {
    return this.payload.equipment ?? null
  }

  get preparation() {
    return this.payload.preparation ?? null
  }

  get execution() {
    return this.payload.execution ?? null
  }

  get order() {
    return this.payload.exercise_order
  }

  get status() {
    return this.payload.status
  }

  get statusLabel() {
    return new SessionExerciseStatusModel(this.payload.status).displayName
  }

  get defaultSets() {
    return this.payload.default_sets ?? null
  }

  get defaultReps() {
    return this.payload.default_reps ?? null
  }

  get defaultWeightValue() {
    return this.payload.default_weight_value ?? null
  }

  get defaultDurationSeconds() {
    return this.payload.default_duration_seconds ?? null
  }

  get defaultDistance() {
    return this.payload.default_distance ?? null
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
}

export class CurrentWorkoutModel {
  private readonly payload: CurrentWorkoutPayload

  constructor(payload: CurrentWorkoutPayload) {
    this.payload = payload
  }

  get state() {
    return this.payload.state
  }

  get workoutSessionId() {
    return this.payload.workout_session_id ?? null
  }

  get routineName() {
    return this.payload.routine_name ?? 'No active routine'
  }

  get splitName() {
    return this.payload.split_name ?? 'No workout selected'
  }

  get displayDay() {
    return this.payload.day_of_week ? dayLabels[this.payload.day_of_week] ?? this.payload.day_of_week : 'Unscheduled'
  }

  get displayScheduledDate() {
    if (!this.payload.scheduled_date) {
      return 'No date scheduled'
    }
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${this.payload.scheduled_date}T00:00:00Z`))
  }

  get status() {
    return this.payload.status ? new WorkoutStatusModel(this.payload.status) : null
  }

  get displayState() {
    if (this.payload.state === 'IN_PROGRESS_SESSION') {
      return 'In progress'
    }
    if (this.payload.state === 'INCOMPLETE_SESSION') {
      return this.status?.displayName ?? 'In progress'
    }
    if (this.payload.state === 'NEXT_SCHEDULED') {
      return 'Next scheduled'
    }
    if (this.payload.state === 'NO_ACTIVE_ROUTINE') {
      return 'No active routine'
    }
    return 'No scheduled workout'
  }

  get hasWorkout() {
    return (
      this.payload.state === 'IN_PROGRESS_SESSION'
      || this.payload.state === 'INCOMPLETE_SESSION'
      || this.payload.state === 'NEXT_SCHEDULED'
    )
  }

  get isInProgress() {
    return this.payload.state === 'IN_PROGRESS_SESSION'
  }

  get exercises() {
    return this.payload.exercises.map((exercise) => new CurrentWorkoutExerciseModel(exercise))
  }

  toJSON() {
    return this.payload
  }
}

export class WorkoutHistorySetModel {
  private readonly payload: WorkoutHistorySetPayload

  constructor(payload: WorkoutHistorySetPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.set_id
  }

  get setNumber() {
    return this.payload.set_number
  }

  get displayResult() {
    const parts: string[] = []
    if (this.payload.reps) {
      parts.push(`${this.payload.reps} reps`)
    }
    if (this.payload.weight) {
      parts.push(`${this.payload.weight} lb`)
    }
    if (this.payload.duration_seconds) {
      parts.push(`${this.payload.duration_seconds}s`)
    }
    if (this.payload.distance) {
      parts.push(`${this.payload.distance} mi`)
    }
    if (this.payload.intensity) {
      parts.push(this.payload.intensity)
    }
    return parts.length > 0 ? parts.join(' - ') : 'No result logged'
  }
}

export class WorkoutHistoryExerciseModel {
  private readonly payload: WorkoutHistoryExercisePayload

  constructor(payload: WorkoutHistoryExercisePayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.session_exercise_id
  }

  get name() {
    return this.payload.name
  }

  get order() {
    return this.payload.exercise_order
  }

  get status() {
    return new SessionExerciseStatusModel(this.payload.status)
  }

  get sets() {
    return this.payload.sets.map((set) => new WorkoutHistorySetModel(set))
  }
}

export class WorkoutHistoryItemModel {
  private readonly payload: WorkoutHistoryItemPayload

  constructor(payload: WorkoutHistoryItemPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.workout_session_id
  }

  get routineName() {
    return this.payload.routine_name ?? 'No routine'
  }

  get splitName() {
    return this.payload.split_name ?? 'Open workout'
  }

  get startDateKey() {
    return this.payload.start_time.slice(0, 10)
  }

  get displayStartDate() {
    return formatDate(this.payload.start_time)
  }

  get displayEndDate() {
    return formatDate(this.payload.end_time)
  }

  get status() {
    return new WorkoutStatusModel(this.payload.status)
  }

  get exercises() {
    return this.payload.exercises.map((exercise) => new WorkoutHistoryExerciseModel(exercise))
  }

  get exerciseCount() {
    return this.payload.exercises.length
  }

  get setCount() {
    return this.payload.exercises.reduce((count, exercise) => count + exercise.sets.length, 0)
  }
}
