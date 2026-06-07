import { apiClient } from '@api/base'
import {
  ExerciseRecordSummaryModel,
  RecordExerciseOptionModel,
} from './recordmodel'
import type {
  ExerciseRecordSummaryPayload,
  ManualExerciseRecordRequestPayload,
  RecordExerciseOptionPayload,
} from './recordschema'
import {
  exerciseRecordSummarySchema,
  manualExerciseRecordRequestSchema,
  recordExerciseOptionSchema,
} from './recordschema'

export const recordsApi = {
  async exercises() {
    const payload = await apiClient.get<RecordExerciseOptionPayload[]>('/api/v1/records/exercises')
    return payload.map((exercise) => new RecordExerciseOptionModel(recordExerciseOptionSchema.parse(exercise)))
  },

  async summary(exerciseId: number) {
    const payload = await apiClient.get<ExerciseRecordSummaryPayload>(`/api/v1/records/exercises/${exerciseId}/summary`)
    return new ExerciseRecordSummaryModel(exerciseRecordSummarySchema.parse(payload))
  },

  async updateManual(exerciseId: number, body: ManualExerciseRecordRequestPayload) {
    const parsedBody = manualExerciseRecordRequestSchema.parse(body)
    const payload = await apiClient.post<ExerciseRecordSummaryPayload, ManualExerciseRecordRequestPayload>(
      `/api/v1/records/exercises/${exerciseId}/manual`,
      parsedBody,
    )
    return new ExerciseRecordSummaryModel(exerciseRecordSummarySchema.parse(payload))
  },
}
