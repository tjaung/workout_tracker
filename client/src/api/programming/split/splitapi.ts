import { CrudApi } from '@api/crud'
import { SplitModel } from './splitmodel'
import type { SplitCreatePayload, SplitPayload, SplitUpdatePayload } from './splitschema'
import { splitSchema } from './splitschema'

export const splitApi = new CrudApi<SplitPayload, SplitCreatePayload, SplitUpdatePayload, SplitModel, number>({
  basePath: '/api/v1/splits',
  idPath: (splitId) => `/${splitId}`,
  makeModel: (payload) => new SplitModel(splitSchema.parse(payload)),
})
