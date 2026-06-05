import { CrudApi } from '@api/crud'
import { SplitExerciseModel } from './splitexercisemodel'
import type {
  SplitExerciseCreatePayload,
  SplitExercisePayload,
  SplitExerciseUpdatePayload,
} from './splitexerciseschema'
import { splitExerciseSchema } from './splitexerciseschema'

export const splitExerciseApi = new CrudApi<
  SplitExercisePayload,
  SplitExerciseCreatePayload,
  SplitExerciseUpdatePayload,
  SplitExerciseModel,
  number
>({
  basePath: '/api/v1/split-exercises',
  idPath: (splitExerciseId) => `/${splitExerciseId}`,
  makeModel: (payload) => new SplitExerciseModel(splitExerciseSchema.parse(payload)),
})
