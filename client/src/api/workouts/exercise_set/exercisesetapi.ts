import { CrudApi } from '@api/crud'
import { ExerciseSetModel } from './exercisesetmodel'
import type { ExerciseSetCreatePayload, ExerciseSetPayload, ExerciseSetUpdatePayload } from './exercisesetschema'
import { exerciseSetSchema } from './exercisesetschema'

export const exerciseSetApi = new CrudApi<
  ExerciseSetPayload,
  ExerciseSetCreatePayload,
  ExerciseSetUpdatePayload,
  ExerciseSetModel,
  number
>({
  basePath: '/api/v1/exercise-sets',
  idPath: (setId) => `/${setId}`,
  makeModel: (payload) => new ExerciseSetModel(exerciseSetSchema.parse(payload)),
})
