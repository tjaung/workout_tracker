import { formatDate } from '@api/model'
import type { UserSettingsLogPayload, UserSettingsPayload } from './usersettingsschema'

export class UserSettingsModel {
  private readonly payload: UserSettingsPayload

  constructor(payload: UserSettingsPayload) {
    this.payload = payload
  }

  get leftHandedMode() {
    return this.payload.left_handed_mode
  }

  get themeMode() {
    return this.payload.theme_mode
  }

  get unitSystem() {
    return this.payload.unit_system
  }

  get workoutRestTimerSeconds() {
    return this.payload.workout_rest_timer_seconds
  }

  get displayRestTimer() {
    return `${this.payload.workout_rest_timer_seconds}s`
  }

  toJSON() {
    return this.payload
  }
}

export class UserSettingsLogModel {
  private readonly payload: UserSettingsLogPayload

  constructor(payload: UserSettingsLogPayload) {
    this.payload = payload
  }

  get id() {
    return this.payload.user_settings_log_id
  }

  get settingKey() {
    return this.payload.setting_key
  }

  get displayChangedAt() {
    return formatDate(this.payload.changed_at)
  }

  get displayChange() {
    return `${stringifyValue(this.payload.old_value)} -> ${stringifyValue(this.payload.new_value)}`
  }
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'string') {
    return value
  }
  return JSON.stringify(value)
}
