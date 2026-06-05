import { ComparisonTypeModel } from '@api/exercises/comparison_type'
import { RecordCategoryModel } from '@api/exercises/record_category'
import type { RecordTypePayload } from './recordtypeschema'

export class RecordTypeModel {
  private readonly payload: RecordTypePayload

  constructor(payload: RecordTypePayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.record_type_id
  }

  get name() {
    return this.payload.name
  }

  get category() {
    return new RecordCategoryModel(this.payload.record_category)
  }

  get comparisonType() {
    return new ComparisonTypeModel(this.payload.comparison_type)
  }

  get displayUnit() {
    return this.payload.default_unit
  }

  toJSON() {
    return this.payload
  }
}
