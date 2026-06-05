import type { RecordSourcePayload } from './recordsourceschema'

export class RecordSourceModel {
  private readonly payload: RecordSourcePayload

  constructor(payload: RecordSourcePayload) {
    this.payload = payload
  }

  get value() {
    return this.payload
  }

  get displayName() {
    return this.payload.replaceAll('_', ' ').toLowerCase()
  }

  toJSON() {
    return this.payload
  }
}
