import type {
  AuthResponsePayload,
  CsrfResponsePayload,
  SessionStatusPayload,
  UserPayload,
} from './authschema'

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

  get createdAt() {
    return new Date(this.payload.created_at)
  }

  get lastLogin() {
    return this.payload.last_login ? new Date(this.payload.last_login) : null
  }

  get displayName() {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || this.username
  }

  get initials() {
    const first = this.firstName.at(0) ?? ''
    const last = this.lastName.at(0) ?? ''
    return `${first}${last}`.toUpperCase() || this.username.slice(0, 2).toUpperCase()
  }

  get displayCreatedAt() {
    return this.createdAt.toLocaleDateString()
  }

  get displayLastLogin() {
    return this.lastLogin ? this.lastLogin.toLocaleString() : 'Never'
  }

  toJSON() {
    return this.payload
  }
}

export class AuthModel {
  readonly user: UserModel

  constructor(payload: AuthResponsePayload) {
    this.user = new UserModel(payload.user)
  }
}

export class SessionStatusModel {
  readonly authenticated: boolean
  readonly user: UserModel | null

  constructor(payload: SessionStatusPayload) {
    this.authenticated = payload.authenticated
    this.user = payload.user ? new UserModel(payload.user) : null
  }

  get displayStatus() {
    return this.authenticated ? 'Authenticated' : 'Signed out'
  }
}

export class CsrfModel {
  private readonly payload: CsrfResponsePayload

  constructor(payload: CsrfResponsePayload) {
    this.payload = payload
  }

  get token() {
    return this.payload.csrf_token
  }

  get headerName() {
    return this.payload.header_name
  }
}
