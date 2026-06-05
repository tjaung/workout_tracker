import type { ComparisonTypePayload } from './comparisontypeschema'

export class ComparisonTypeModel {
  private readonly payload: ComparisonTypePayload

  constructor(payload: ComparisonTypePayload) {
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
