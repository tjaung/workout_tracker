import { CrudApi } from '@api/crud'
import { ExerciseMuscleGroupModel } from './exercisemusclegroupmodel'
import type {
  ExerciseMuscleGroupCreatePayload,
  ExerciseMuscleGroupId,
  ExerciseMuscleGroupPayload,
  ExerciseMuscleGroupUpdatePayload,
} from './exercisemusclegroupschema'
import { exerciseMuscleGroupSchema } from './exercisemusclegroupschema'

export const exerciseMuscleGroupApi = new CrudApi<
  ExerciseMuscleGroupPayload,
  ExerciseMuscleGroupCreatePayload,
  ExerciseMuscleGroupUpdatePayload,
  ExerciseMuscleGroupModel,
  ExerciseMuscleGroupId
>({
  basePath: '/api/v1/exercise-muscle-groups',
  idPath: (id) => `/${id.exercise_id}/${id.muscle_group_id}`,
  makeModel: (payload) => new ExerciseMuscleGroupModel(exerciseMuscleGroupSchema.parse(payload)),
})
