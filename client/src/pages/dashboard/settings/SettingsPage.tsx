import { useEffect, useState, type FormEvent } from 'react'
import {
  type ThemeModePayload,
  type UnitSystemPayload,
  UserSettingsModel,
  type UserSettingsUpdatePayload,
  userAccountApi,
  userSettingsApi,
} from '@api/users'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Loading } from '@components/ui/loading'
import { useAuth } from '@hooks/auth/useAuth'

export function SettingsPage() {
  const { refreshSession, user } = useAuth()
  const [settings, setSettings] = useState<UserSettingsModel | null>(null)
  const [accountMessage, setAccountMessage] = useState<string | null>(null)
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAccount, setIsSavingAccount] = useState(false)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')

  useEffect(() => {
    let isMounted = true

    userSettingsApi
      .get()
      .then((loadedSettings) => {
        if (isMounted) {
          setSettings(loadedSettings)
        }
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load settings')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setFirstName(user?.firstName ?? '')
    setLastName(user?.lastName ?? '')
    setUsername(user?.username ?? '')
    setEmail(user?.email ?? '')
  }, [user])

  const updateSettings = async (payload: UserSettingsUpdatePayload) => {
    setSettingsMessage(null)
    setError(null)
    try {
      const updatedSettings = await userSettingsApi.update(payload)
      setSettings(updatedSettings)
      setSettingsMessage('Settings saved.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save settings')
    }
  }

  const saveAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAccountMessage(null)
    setError(null)
    setIsSavingAccount(true)

    try {
      await userAccountApi.update({
        email,
        first_name: firstName,
        last_name: lastName,
        password: password.trim() || undefined,
        username,
      })
      await refreshSession()
      setPassword('')
      setAccountMessage('Account saved.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save account')
    } finally {
      setIsSavingAccount(false)
    }
  }

  if (isLoading) {
    return <Loading fullPage label="Loading settings" size="lg" />
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
            Accessibility
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Interface controls</h1>
          <div className="mt-5">
            <SettingToggle
              checked={settings?.leftHandedMode ?? false}
              description="Moves the mobile floating nav to the left side of the screen."
              label="Left-handed mode"
              onChange={(checked) => void updateSettings({ left_handed_mode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
            Preferences
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Display and workout defaults</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Theme mode"
              onChange={(value) => void updateSettings({ theme_mode: value as ThemeModePayload })}
              options={[
                { label: 'System', value: 'system' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              value={settings?.themeMode ?? 'dark'}
            />
            <SelectField
              label="Unit system"
              onChange={(value) => void updateSettings({ unit_system: value as UnitSystemPayload })}
              options={[
                { label: 'Imperial', value: 'imperial' },
                { label: 'Metric', value: 'metric' },
              ]}
              value={settings?.unitSystem ?? 'imperial'}
            />
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">Rest timer seconds</span>
              <Input
                max="600"
                min="5"
                onBlur={(event) => {
                  const value = Number.parseInt(event.target.value, 10)
                  if (Number.isFinite(value)) {
                    void updateSettings({ workout_rest_timer_seconds: value })
                  }
                }}
                type="number"
                value={settings?.workoutRestTimerSeconds ?? 90}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10)
                  if (Number.isFinite(value)) {
                    setSettings((current) => current ? newSettingsWithRestTimer(current, value) : current)
                  }
                }}
              />
            </label>
          </div>
          {settingsMessage ? <p className="mt-4 text-sm font-medium text-muted">{settingsMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
            Account
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Profile and login</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveAccount}>
            <TextField label="First name" onChange={setFirstName} value={firstName} />
            <TextField label="Last name" onChange={setLastName} value={lastName} />
            <TextField label="Username" onChange={setUsername} value={username} />
            <TextField label="Email" onChange={setEmail} type="email" value={email} />
            <TextField label="New password" onChange={setPassword} type="password" value={password} />
            <div className="flex items-end justify-end">
              <Button disabled={isSavingAccount} type="submit">
                {isSavingAccount ? 'Saving...' : 'Save account'}
              </Button>
            </div>
          </form>
          {accountMessage ? <p className="mt-4 text-sm font-medium text-muted">{accountMessage}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}

function SettingToggle({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-alabaster-grey p-4">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-1 block text-sm text-muted">{description}</span>
      </span>
      <input
        checked={checked}
        className="h-5 w-5 accent-primary"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">{label}</span>
      <select
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function TextField({
  label,
  onChange,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">{label}</span>
      <Input onChange={(event) => onChange(event.target.value)} type={type} value={value} />
    </label>
  )
}

function newSettingsWithRestTimer(settings: UserSettingsModel, seconds: number) {
  return new UserSettingsModel({
    ...settings.toJSON(),
    workout_rest_timer_seconds: seconds,
  })
}
