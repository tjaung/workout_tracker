import { apiClient } from '@api/base'
import { CrudApi } from '@api/crud'
import { ExerciseModel } from './exercisemodel'
import type { ExerciseCreatePayload, ExercisePayload, ExerciseUpdatePayload } from './exerciseschema'
import { exerciseSchema } from './exerciseschema'

export const exerciseApi = new CrudApi<
  ExercisePayload,
  ExerciseCreatePayload,
  ExerciseUpdatePayload,
  ExerciseModel,
  number
>({
  basePath: '/api/v1/exercises',
  idPath: (exerciseId) => `/${exerciseId}`,
  makeModel: (payload) => new ExerciseModel(exerciseSchema.parse(payload)),
})

export const exerciseDetailApi = {
  async list(options?: { limit?: number; skip?: number }) {
    const query = options ? { limit: options.limit, skip: options.skip } : undefined
    const payload = await apiClient.get<ExercisePayload[]>('/api/v1/exercises/detailed', { query })
    return payload.map((exercise) => new ExerciseModel(exerciseSchema.parse(exercise)))
  },
}
