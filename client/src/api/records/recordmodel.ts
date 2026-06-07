import type {
  ExerciseRecordSummaryPayload,
  ExerciseRecordValuePayload,
  RecordExerciseOptionPayload,
} from './recordschema'

export class RecordExerciseOptionModel {
  private readonly payload: RecordExerciseOptionPayload

  constructor(payload: RecordExerciseOptionPayload) {
    this.payload = payload
  }

  get exerciseId() {
    return this.payload.exercise_id
  }

  get name() {
    return this.payload.name
  }

  get exerciseType() {
    return this.payload.exercise_type
  }

  get equipment() {
    return this.payload.equipment ?? null
  }

  get displayType() {
    return this.exerciseType.toLowerCase().replaceAll('_', ' ')
  }
}

export class ExerciseRecordValueModel {
  private readonly payload: ExerciseRecordValuePayload

  constructor(payload: ExerciseRecordValuePayload) {
    this.payload = payload
  }

  get key() {
    return this.payload.key
  }

  get label() {
    return this.payload.label
  }

  get value() {
    return this.payload.value
  }

  get unit() {
    return this.payload.unit
  }

  get source() {
    return this.payload.source
  }

  get displayValue() {
    return this.payload.display_value
  }

  get isManual() {
    return this.source === 'MANUAL'
  }
}

export class ExerciseRecordSummaryModel {
  readonly exercise: RecordExerciseOptionModel
  readonly records: ExerciseRecordValueModel[]

  constructor(payload: ExerciseRecordSummaryPayload) {
    this.exercise = new RecordExerciseOptionModel(payload.exercise)
    this.records = payload.records.map((record) => new ExerciseRecordValueModel(record))
  }
}
