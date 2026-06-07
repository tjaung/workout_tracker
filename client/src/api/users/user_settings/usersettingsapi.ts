import { apiClient } from '@api/base'
import { UserSettingsLogModel, UserSettingsModel } from './usersettingsmodel'
import type { UserSettingsLogPayload, UserSettingsPayload, UserSettingsUpdatePayload } from './usersettingsschema'
import { userSettingsLogSchema, userSettingsSchema, userSettingsUpdateSchema } from './usersettingsschema'

export const userSettingsApi = {
  async get() {
    const payload = await apiClient.get<UserSettingsPayload>('/api/v1/users/me/settings')
    return new UserSettingsModel(userSettingsSchema.parse(payload))
  },

  async update(payload: UserSettingsUpdatePayload) {
    const parsedPayload = userSettingsUpdateSchema.parse(payload)
    const settings = await apiClient.update<UserSettingsPayload, UserSettingsUpdatePayload>(
      '/api/v1/users/me/settings',
      parsedPayload,
    )
    const model = new UserSettingsModel(userSettingsSchema.parse(settings))
    window.dispatchEvent(new CustomEvent('user-settings-updated', { detail: model.toJSON() }))
    return model
  },

  async logs() {
    const payload = await apiClient.get<UserSettingsLogPayload[]>('/api/v1/users/me/settings/logs')
    return payload.map((log) => new UserSettingsLogModel(userSettingsLogSchema.parse(log)))
  },
}
