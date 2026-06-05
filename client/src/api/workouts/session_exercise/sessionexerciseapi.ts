import { CrudApi } from '@api/crud'
import { SessionExerciseModel } from './sessionexercisemodel'
import type {
  SessionExerciseCreatePayload,
  SessionExercisePayload,
  SessionExerciseUpdatePayload,
} from './sessionexerciseschema'
import { sessionExerciseSchema } from './sessionexerciseschema'

export const sessionExerciseApi = new CrudApi<
  SessionExercisePayload,
  SessionExerciseCreatePayload,
  SessionExerciseUpdatePayload,
  SessionExerciseModel,
  number
>({
  basePath: '/api/v1/session-exercises',
  idPath: (sessionExerciseId) => `/${sessionExerciseId}`,
  makeModel: (payload) => new SessionExerciseModel(sessionExerciseSchema.parse(payload)),
})
