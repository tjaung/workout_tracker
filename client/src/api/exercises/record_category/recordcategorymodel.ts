import type { RecordCategoryPayload } from './recordcategoryschema'

export class RecordCategoryModel {
  private readonly payload: RecordCategoryPayload

  constructor(payload: RecordCategoryPayload) {
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
