import { apiClient } from '@api/base'
import { CrudApi } from '@api/crud'
import { UserModel } from './usermodel'
import type { UserAccountUpdatePayload, UserCreatePayload, UserPayload, UserUpdatePayload } from './userschema'
import { userAccountUpdateSchema, userSchema } from './userschema'

export const userApi = new CrudApi<UserPayload, UserCreatePayload, UserUpdatePayload, UserModel, number>({
  basePath: '/api/v1/users',
  idPath: (userId) => `/${userId}`,
  makeModel: (payload) => new UserModel(userSchema.parse(payload)),
})

export const userAccountApi = {
  async update(payload: UserAccountUpdatePayload) {
    const parsedPayload = userAccountUpdateSchema.parse(payload)
    const user = await apiClient.update<UserPayload, UserAccountUpdatePayload>('/api/v1/users/me/account', parsedPayload)
    return new UserModel(userSchema.parse(user))
  },
}
