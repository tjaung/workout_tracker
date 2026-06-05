import { CrudApi } from '@api/crud'
import { UserExerciseRecordModel } from './userexerciserecordmodel'
import type {
  UserExerciseRecordCreatePayload,
  UserExerciseRecordPayload,
  UserExerciseRecordUpdatePayload,
} from './userexerciserecordschema'
import { userExerciseRecordSchema } from './userexerciserecordschema'

export const userExerciseRecordApi = new CrudApi<
  UserExerciseRecordPayload,
  UserExerciseRecordCreatePayload,
  UserExerciseRecordUpdatePayload,
  UserExerciseRecordModel,
  number
>({
  basePath: '/api/v1/user-exercise-records',
  idPath: (recordId) => `/${recordId}`,
  makeModel: (payload) => new UserExerciseRecordModel(userExerciseRecordSchema.parse(payload)),
})
