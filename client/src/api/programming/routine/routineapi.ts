import { apiClient } from '@api/base'
import { CrudApi } from '@api/crud'
import { RoutineDetailModel, RoutineModel } from './routinemodel'
import type {
  RoutineCreatePayload,
  RoutineDetailPayload,
  RoutineFullCreatePayload,
  RoutinePayload,
  RoutineUpdatePayload,
} from './routineschema'
import { routineDetailSchema, routineSchema } from './routineschema'

export const routineApi = new CrudApi<
  RoutinePayload,
  RoutineCreatePayload,
  RoutineUpdatePayload,
  RoutineModel,
  number
>({
  basePath: '/api/v1/routines',
  idPath: (routineId) => `/${routineId}`,
  makeModel: (payload) => new RoutineModel(routineSchema.parse(payload)),
})

export const routineDetailApi = {
  async getActive() {
    const payload = await apiClient.get<RoutineDetailPayload | null>('/api/v1/routines/active')
    return payload ? new RoutineDetailModel(routineDetailSchema.parse(payload)) : null
  },

  async list(options?: { limit?: number; skip?: number }) {
    const query = options ? { limit: options.limit, skip: options.skip } : undefined
    const payload = await apiClient.get<RoutineDetailPayload[]>('/api/v1/routines/detailed', {
      query,
    })
    return payload.map((routine) => new RoutineDetailModel(routineDetailSchema.parse(routine)))
  },

  async listMine(options?: { limit?: number; skip?: number }) {
    const query = options ? { limit: options.limit, skip: options.skip } : undefined
    const payload = await apiClient.get<RoutineDetailPayload[]>('/api/v1/routines/me', {
      query,
    })
    return payload.map((routine) => new RoutineDetailModel(routineDetailSchema.parse(routine)))
  },

  async createFull(payload: RoutineFullCreatePayload) {
    const routine = await apiClient.post<RoutineDetailPayload, RoutineFullCreatePayload>('/api/v1/routines/full', payload)
    return new RoutineDetailModel(routineDetailSchema.parse(routine))
  },
}
