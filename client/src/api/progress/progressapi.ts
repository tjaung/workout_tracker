import { apiClient } from '@api/base'
import {
  ProgressAggregatePointModel,
  ProgressBodyMeasurementPointModel,
  ProgressExercisePointModel,
  ProgressRecordPointModel,
  ProgressRoutinePointModel,
  ProgressSummaryModel,
  ProgressWorkoutPointModel,
} from './progressmodel'
import type {
  ProgressAggregatePointPayload,
  ProgressBodyMeasurementPointPayload,
  ProgressExercisePointPayload,
  ProgressRecordPointPayload,
  ProgressRoutinePointPayload,
  ProgressSummaryPayload,
  ProgressWorkoutPointPayload,
} from './progressschema'
import {
  progressAggregatePointSchema,
  progressBodyMeasurementPointSchema,
  progressExercisePointSchema,
  progressRecordPointSchema,
  progressRoutinePointSchema,
  progressSummarySchema,
  progressWorkoutPointSchema,
} from './progressschema'

export type AggregationPeriod = 'day' | 'week' | 'month' | 'year'

type ProgressQuery = {
  aggregation?: AggregationPeriod
  endDate?: string
  exerciseId?: number
  startDate?: string
}

function query(options?: ProgressQuery) {
  return {
    end_date: options?.endDate,
    exercise_id: options?.exerciseId,
    period: options?.aggregation,
    start_date: options?.startDate,
  }
}

export const progressApi = {
  async summary(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressSummaryPayload>('/api/v1/progress/summary', { query: query(options) })
    return new ProgressSummaryModel(progressSummarySchema.parse(payload))
  },

  async bodyMeasurements(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressBodyMeasurementPointPayload[]>('/api/v1/progress/body-measurements', { query: query(options) })
    return payload.map((point) => new ProgressBodyMeasurementPointModel(progressBodyMeasurementPointSchema.parse(point)))
  },

  async workouts(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressWorkoutPointPayload[]>('/api/v1/progress/workouts', { query: query(options) })
    return payload.map((point) => new ProgressWorkoutPointModel(progressWorkoutPointSchema.parse(point)))
  },

  async routines(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressRoutinePointPayload[]>('/api/v1/progress/routines', { query: query(options) })
    return payload.map((point) => new ProgressRoutinePointModel(progressRoutinePointSchema.parse(point)))
  },

  async exercises(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressExercisePointPayload[]>('/api/v1/progress/exercises', { query: query(options) })
    return payload.map((point) => new ProgressExercisePointModel(progressExercisePointSchema.parse(point)))
  },

  async records(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressRecordPointPayload[]>('/api/v1/progress/records', { query: query(options) })
    return payload.map((point) => new ProgressRecordPointModel(progressRecordPointSchema.parse(point)))
  },

  async aggregateBodyMeasurements(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressAggregatePointPayload[]>('/api/v1/progress/body-measurements/aggregate', { query: query(options) })
    return payload.map((point) => new ProgressAggregatePointModel(progressAggregatePointSchema.parse(point)))
  },

  async aggregateWorkouts(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressAggregatePointPayload[]>('/api/v1/progress/workouts/aggregate', { query: query(options) })
    return payload.map((point) => new ProgressAggregatePointModel(progressAggregatePointSchema.parse(point)))
  },

  async aggregateExercises(options?: ProgressQuery) {
    const payload = await apiClient.get<ProgressAggregatePointPayload[]>('/api/v1/progress/exercises/aggregate', { query: query(options) })
    return payload.map((point) => new ProgressAggregatePointModel(progressAggregatePointSchema.parse(point)))
  },
}
