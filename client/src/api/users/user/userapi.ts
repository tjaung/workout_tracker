import { CrudApi } from '@api/crud'
import { UserModel } from './usermodel'
import type { UserCreatePayload, UserPayload, UserUpdatePayload } from './userschema'
import { userSchema } from './userschema'

export const userApi = new CrudApi<UserPayload, UserCreatePayload, UserUpdatePayload, UserModel, number>({
  basePath: '/api/v1/users',
  idPath: (userId) => `/${userId}`,
  makeModel: (payload) => new UserModel(userSchema.parse(payload)),
})
