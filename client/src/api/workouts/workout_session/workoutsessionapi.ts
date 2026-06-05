import { CrudApi } from '@api/crud'
import { WorkoutSessionModel } from './workoutsessionmodel'
import type {
  WorkoutSessionCreatePayload,
  WorkoutSessionPayload,
  WorkoutSessionUpdatePayload,
} from './workoutsessionschema'
import { workoutSessionSchema } from './workoutsessionschema'

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
