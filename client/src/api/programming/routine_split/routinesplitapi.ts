import { CrudApi } from '@api/crud'
import { RoutineSplitModel } from './routinesplitmodel'
import type {
  RoutineSplitCreatePayload,
  RoutineSplitId,
  RoutineSplitPayload,
  RoutineSplitUpdatePayload,
} from './routinesplitschema'
import { routineSplitSchema } from './routinesplitschema'

export const routineSplitApi = new CrudApi<
  RoutineSplitPayload,
  RoutineSplitCreatePayload,
  RoutineSplitUpdatePayload,
  RoutineSplitModel,
  RoutineSplitId
>({
  basePath: '/api/v1/routine-splits',
  idPath: (id) => `/${id.routine_id}/${id.split_id}`,
  makeModel: (payload) => new RoutineSplitModel(routineSplitSchema.parse(payload)),
})
