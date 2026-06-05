import { CrudApi } from '@api/crud'
import { RecordTypeModel } from './recordtypemodel'
import type { RecordTypeCreatePayload, RecordTypePayload, RecordTypeUpdatePayload } from './recordtypeschema'
import { recordTypeSchema } from './recordtypeschema'

export const recordTypeApi = new CrudApi<
  RecordTypePayload,
  RecordTypeCreatePayload,
  RecordTypeUpdatePayload,
  RecordTypeModel,
  number
>({
  basePath: '/api/v1/record-types',
  idPath: (recordTypeId) => `/${recordTypeId}`,
  makeModel: (payload) => new RecordTypeModel(recordTypeSchema.parse(payload)),
})
