import { apiClient } from '@api/base'
import {
  authResponseSchema,
  csrfResponseSchema,
  loginPayloadSchema,
  sessionStatusSchema,
  signupPayloadSchema,
  type LoginPayload,
  type SignupPayload,
} from './authschema'
import { AuthModel, CsrfModel, SessionStatusModel, UserModel } from './authmodel'

class AuthApi {
  private csrf: CsrfModel | null = null

  async getCsrf() {
    const payload = csrfResponseSchema.parse(await apiClient.get('/api/v1/auth/csrf'))
    this.csrf = new CsrfModel(payload)
    return this.csrf
  }

  async signup(payload: SignupPayload) {
    const parsedPayload = signupPayloadSchema.parse(payload)
    const user = await apiClient.post('/api/v1/auth/signup', parsedPayload)
    return new UserModel(authResponseSchema.shape.user.parse(user))
  }

  async login(payload: LoginPayload) {
    const parsedPayload = loginPayloadSchema.parse(payload)
    const csrf = await this.ensureCsrf()
    const response = await apiClient.post('/api/v1/auth/login', parsedPayload, {
      headers: {
        [csrf.headerName]: csrf.token,
      },
    })
    this.csrf = null
    return new AuthModel(authResponseSchema.parse(response))
  }

  async logout() {
    const csrf = await this.ensureCsrf()
    await apiClient.post('/api/v1/auth/logout', undefined, {
      headers: {
        [csrf.headerName]: csrf.token,
      },
    })
    this.csrf = null
  }

  async getSession() {
    const response = await apiClient.get('/api/v1/auth/me')
    return new SessionStatusModel(sessionStatusSchema.parse(response))
  }

  private async ensureCsrf() {
    if (this.csrf) {
      return this.csrf
    }
    return this.getCsrf()
  }
}

export const authApi = new AuthApi()
