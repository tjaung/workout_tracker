import { CrudApi } from '@api/crud'
import { BodyMeasurementModel } from './bodymeasurementmodel'
import type {
  BodyMeasurementCreatePayload,
  BodyMeasurementPayload,
  BodyMeasurementUpdatePayload,
} from './bodymeasurementschema'
import { bodyMeasurementSchema } from './bodymeasurementschema'

export const bodyMeasurementApi = new CrudApi<
  BodyMeasurementPayload,
  BodyMeasurementCreatePayload,
  BodyMeasurementUpdatePayload,
  BodyMeasurementModel,
  number
>({
  basePath: '/api/v1/body-measurements',
  idPath: (measurementId) => `/${measurementId}`,
  makeModel: (payload) => new BodyMeasurementModel(bodyMeasurementSchema.parse(payload)),
})
