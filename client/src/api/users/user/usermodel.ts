import { formatDate } from '@api/model'
import type { UserPayload } from './userschema'

export class UserModel {
  private readonly payload: UserPayload

  constructor(payload: UserPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.user_id
  }

  get username() {
    return this.payload.username
  }

  get email() {
    return this.payload.email
  }

  get firstName() {
    return this.payload.first_name
  }

  get lastName() {
    return this.payload.last_name
  }

  get displayName() {
    return `${this.firstName} ${this.lastName}`
  }

  get initials() {
    return `${this.firstName[0] ?? ''}${this.lastName[0] ?? ''}`.toUpperCase()
  }

  get displayCreatedAt() {
    return formatDate(this.payload.created_at)
  }

  get displayLastLogin() {
    return formatDate(this.payload.last_login)
  }

  toJSON() {
    return this.payload
  }
}
