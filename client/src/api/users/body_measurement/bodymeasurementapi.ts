import { apiClient } from '@api/base'
import { CrudApi } from '@api/crud'
import { BodyMeasurementModel } from './bodymeasurementmodel'
import type {
  BodyMeasurementCreatePayload,
  BodyMeasurementPayload,
  BodyMeasurementUpdatePayload,
  CurrentBodyMeasurementCreatePayload,
} from './bodymeasurementschema'
import { bodyMeasurementSchema, currentBodyMeasurementCreateSchema } from './bodymeasurementschema'

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

export const bodyMeasurementCurrentApi = {
  async list(options?: { limit?: number; skip?: number }) {
    const payload = await apiClient.get<BodyMeasurementPayload[]>('/api/v1/body-measurements/me', {
      query: options,
    })
    return payload.map((measurement) => new BodyMeasurementModel(bodyMeasurementSchema.parse(measurement)))
  },

  async create(payload: CurrentBodyMeasurementCreatePayload) {
    const parsedPayload = currentBodyMeasurementCreateSchema.parse(payload)
    const measurement = await apiClient.post<BodyMeasurementPayload, CurrentBodyMeasurementCreatePayload>(
      '/api/v1/body-measurements/current',
      parsedPayload,
    )
    return new BodyMeasurementModel(bodyMeasurementSchema.parse(measurement))
  },
}
