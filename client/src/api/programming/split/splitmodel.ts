import { formatDate } from '@api/model'
import type { SplitPayload } from './splitschema'

export class SplitModel {
  private readonly payload: SplitPayload

  constructor(payload: SplitPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.split_id
  }

  get name() {
    return this.payload.split_name
  }

  get displayCreatedAt() {
    return formatDate(this.payload.created_at)
  }

  get displayScope() {
    return this.payload.is_global ? 'Global' : 'Personal'
  }

  toJSON() {
    return this.payload
  }
}
