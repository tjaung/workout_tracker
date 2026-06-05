import { CrudApi } from '@api/crud'
import { MuscleGroupModel } from './musclegroupmodel'
import type {
  MuscleGroupCreatePayload,
  MuscleGroupPayload,
  MuscleGroupUpdatePayload,
} from './musclegroupschema'
import { muscleGroupSchema } from './musclegroupschema'

export const muscleGroupApi = new CrudApi<
  MuscleGroupPayload,
  MuscleGroupCreatePayload,
  MuscleGroupUpdatePayload,
  MuscleGroupModel,
  number
>({
  basePath: '/api/v1/muscle-groups',
  idPath: (muscleGroupId) => `/${muscleGroupId}`,
  makeModel: (payload) => new MuscleGroupModel(muscleGroupSchema.parse(payload)),
})
