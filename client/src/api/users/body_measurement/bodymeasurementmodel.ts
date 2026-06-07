import { formatDate, formatNumber } from '@api/model'
import type { BodyMeasurementPayload } from './bodymeasurementschema'

export class BodyMeasurementModel {
  private readonly payload: BodyMeasurementPayload

  constructor(payload: BodyMeasurementPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.measurement_id
  }

  get userId() {
    return this.payload.user_id
  }

  get displayMeasuredAt() {
    return formatDate(this.payload.measured_at)
  }

  get displayHeight() {
    return formatNumber(this.payload.height_cm, 'cm')
  }

  get displayWeight() {
    return formatNumber(this.payload.weight_kg, 'kg')
  }

  get displayBodyFat() {
    return formatNumber(this.payload.body_fat_percentage, '%')
  }

  get isCurrent() {
    return this.payload.is_current ?? false
  }

  toJSON() {
    return this.payload
  }
}
