import { apiClient } from '@api/base'
import { CrudApi } from '@api/crud'
import { CurrentWorkoutModel, WorkoutHistoryItemModel, WorkoutSessionModel } from './workoutsessionmodel'
import type {
  CompleteWorkoutPayload,
  CurrentWorkoutPayload,
  StartWorkoutPayload,
  WorkoutHistoryItemPayload,
  WorkoutSessionCreatePayload,
  WorkoutSessionPayload,
  WorkoutSessionUpdatePayload,
} from './workoutsessionschema'
import { currentWorkoutSchema, workoutHistoryItemSchema, workoutSessionSchema } from './workoutsessionschema'

export const workoutSessionApi = new CrudApi<
  WorkoutSessionPayload,
  WorkoutSessionCreatePayload,
  WorkoutSessionUpdatePayload,
  WorkoutSessionModel,
  number
>({
  basePath: '/api/v1/workout-sessions',
  idPath: (workoutSessionId) => `/${workoutSessionId}`,
  makeModel: (payload) => new WorkoutSessionModel(workoutSessionSchema.parse(payload)),
})

export const currentWorkoutApi = {
  async getCurrent() {
    const payload = await apiClient.get<CurrentWorkoutPayload>('/api/v1/workouts/current')
    return new CurrentWorkoutModel(currentWorkoutSchema.parse(payload))
  },

  async start(payload: StartWorkoutPayload) {
    const workout = await apiClient.post<CurrentWorkoutPayload, StartWorkoutPayload>('/api/v1/workouts/start', payload)
    return new CurrentWorkoutModel(currentWorkoutSchema.parse(workout))
  },

  async complete(workoutSessionId: number, payload: CompleteWorkoutPayload) {
    const workout = await apiClient.post<CurrentWorkoutPayload, CompleteWorkoutPayload>(
      `/api/v1/workouts/${workoutSessionId}/complete`,
      payload,
    )
    return new CurrentWorkoutModel(currentWorkoutSchema.parse(workout))
  },
}

export const workoutHistoryApi = {
  async list() {
    const payload = await apiClient.get<WorkoutHistoryItemPayload[]>('/api/v1/workouts/history')
    return payload.map((workout) => new WorkoutHistoryItemModel(workoutHistoryItemSchema.parse(workout)))
  },
}
