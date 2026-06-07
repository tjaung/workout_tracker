import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { type CurrentWorkoutModel, currentWorkoutApi } from '@api/workouts'
import {
  type BodyMeasurementModel,
  bodyMeasurementCurrentApi,
  type CurrentBodyMeasurementCreatePayload,
} from '@api/users'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Loading } from '@components/ui/loading'
import { useAuth } from '@hooks/auth/useAuth'
import { useModal } from '@hooks/modal/useModal'
import { CurrentWorkoutActions, CurrentWorkoutCard } from '@pages/dashboard/workouts/WorkoutsPage'
import { cn } from '@lib/cn'
import {
  type ActivityLevel,
  type BiologicalSex,
  get_activity_calories,
  get_activity_multiplier,
  get_bmr,
  get_tdee,
  round_calories,
} from '@utils/tdee'

const activityTabs: { label: string; level: ActivityLevel; summary: string }[] = [
  { label: 'Light', level: 'light', summary: 'Training 1-3 days per week' },
  { label: 'Moderate', level: 'moderate', summary: 'Training 3-5 days per week' },
  { label: 'Heavy', level: 'heavy', summary: 'Training 6+ days per week' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { closeModal, openModal } = useModal()
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkoutModel | null>(null)
  const [latestMeasurement, setLatestMeasurement] = useState<BodyMeasurementModel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      currentWorkoutApi.getCurrent(),
      bodyMeasurementCurrentApi.list({ limit: 100 }),
    ])
      .then(([workout, measurements]) => {
        if (!isMounted) {
          return
        }

        setCurrentWorkout(workout)
        setLatestMeasurement(getLatestMeasurement(measurements))
      })
      .catch((caughtError: unknown) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load dashboard')
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

  if (isLoading) {
    return <Loading fullPage label="Loading dashboard" size="lg" />
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

      <CurrentWorkoutCard
        currentWorkout={currentWorkout}
        onAddRoutine={() => navigate('/routines/add-routine')}
      />
      <CurrentWorkoutActions currentWorkout={currentWorkout} />

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <UserStatsCard
          latestMeasurement={latestMeasurement}
          onLogMeasurement={() => openModal(
            <MeasurementFormModal
              latestMeasurement={latestMeasurement}
              onCancel={closeModal}
              onCreated={(measurement) => {
                setLatestMeasurement(measurement)
                closeModal()
              }}
            />,
            { title: 'Log new measurements' },
          )}
          user={user}
        />
        <TdeeCalculator initialMeasurement={latestMeasurement} />
      </section>
    </div>
  )
}

function UserStatsCard({
  latestMeasurement,
  onLogMeasurement,
  user,
}: {
  latestMeasurement: BodyMeasurementModel | null
  onLogMeasurement: () => void
  user: ReturnType<typeof useAuth>['user']
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
              User stats
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{user?.displayName ?? 'Athlete'}</h2>
            <p className="mt-2 text-muted">
              Current measurements and account basics.
            </p>
          </div>
          <Button onClick={onLogMeasurement} size="sm" variant="outline">
            Log new measurements
          </Button>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <InfoItem label="Weight" value={latestMeasurement?.displayWeight} />
          <InfoItem label="Height" value={latestMeasurement?.displayHeight} />
          <InfoItem label="Body fat" value={latestMeasurement?.displayBodyFat} />
          <InfoItem label="Measured" value={latestMeasurement?.displayMeasuredAt} />
          <InfoItem label="Username" value={user?.username} />
          <InfoItem label="Last login" value={user?.displayLastLogin} />
        </dl>
      </CardContent>
    </Card>
  )
}

function MeasurementFormModal({
  latestMeasurement,
  onCancel,
  onCreated,
}: {
  latestMeasurement: BodyMeasurementModel | null
  onCancel: () => void
  onCreated: (measurement: BodyMeasurementModel) => void
}) {
  const latest = latestMeasurement?.toJSON()
  const [measuredAt, setMeasuredAt] = useState(() => toDateTimeLocalValue(latest?.measured_at ?? new Date().toISOString()))
  const [heightCm, setHeightCm] = useState(latest?.height_cm?.toString() ?? '')
  const [weightKg, setWeightKg] = useState(latest?.weight_kg?.toString() ?? '')
  const [bodyFatPercentage, setBodyFatPercentage] = useState(latest?.body_fat_percentage?.toString() ?? '')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload: CurrentBodyMeasurementCreatePayload = {
      body_fat_percentage: parseOptionalNumber(bodyFatPercentage),
      height_cm: parseOptionalNumber(heightCm),
      measured_at: measuredAt ? new Date(measuredAt).toISOString() : new Date().toISOString(),
      notes: notes.trim() || null,
      weight_kg: parseOptionalNumber(weightKg),
    }

    try {
      const measurement = await bodyMeasurementCurrentApi.create(payload)
      onCreated(measurement)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log measurements')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">Measured at</span>
          <Input onChange={(event) => setMeasuredAt(event.target.value)} type="datetime-local" value={measuredAt} />
        </label>
        <NumberField label="Height cm" onChange={setHeightCm} value={heightCm} />
        <NumberField label="Weight kg" onChange={setWeightKg} value={weightKg} />
        <NumberField label="Body fat %" onChange={setBodyFatPercentage} value={bodyFatPercentage} />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">Notes</span>
        <textarea
          className="min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25"
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
          value={notes}
        />
      </label>

      <div className="flex justify-end gap-3">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Entering...' : 'Enter'}
        </Button>
      </div>
    </form>
  )
}

function TdeeCalculator({ initialMeasurement }: { initialMeasurement: BodyMeasurementModel | null }) {
  const latest = initialMeasurement?.toJSON()
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [sex, setSex] = useState<BiologicalSex>('male')
  const [age, setAge] = useState('30')
  const [heightCm, setHeightCm] = useState(latest?.height_cm?.toString() ?? '178')
  const [weightKg, setWeightKg] = useState(latest?.weight_kg?.toString() ?? '82')

  useEffect(() => {
    if (latest?.height_cm) {
      setHeightCm(latest.height_cm.toString())
    }
    if (latest?.weight_kg) {
      setWeightKg(latest.weight_kg.toString())
    }
  }, [latest?.height_cm, latest?.weight_kg])

  const input = useMemo(() => ({
    activityLevel,
    age: parseNumber(age),
    heightCm: parseNumber(heightCm),
    sex,
    weightKg: parseNumber(weightKg),
  }), [activityLevel, age, heightCm, sex, weightKg])

  const result = useMemo(() => {
    if (!isValidTdeeInput(input)) {
      return null
    }
    return get_tdee(input)
  }, [input])

  const bmrStep = result ? get_bmr(input) : null
  const multiplierStep = get_activity_multiplier(activityLevel)
  const activityStep = result ? get_activity_calories(result.bmr, result.multiplier) : null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
              TDEE calculator
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {result ? `${round_calories(result.tdee)} calories` : 'Enter your stats'}
            </h2>
            <p className="mt-2 text-muted">
              Estimate daily calories from BMR and activity.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {activityTabs.map((tab) => (
            <button
              className={cn(
                'rounded-md border border-border px-3 py-2 text-left text-sm font-medium transition-colors hover:cursor-pointer hover:border-secondary hover:bg-surface-muted',
                activityLevel === tab.level ? 'border-primary bg-primary text-primary-foreground' : 'bg-surface',
              )}
              key={tab.level}
              onClick={() => setActivityLevel(tab.level)}
              type="button"
            >
              <span className="block">{tab.label}</span>
              <span className="mt-1 block text-xs opacity-75">{tab.summary}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">Sex</span>
            <select
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              onChange={(event) => setSex(event.target.value as BiologicalSex)}
              value={sex}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <NumberField label="Age" onChange={setAge} value={age} />
          <NumberField label="Height cm" onChange={setHeightCm} value={heightCm} />
          <NumberField label="Weight kg" onChange={setWeightKg} value={weightKg} />
        </div>

        <div className="mt-6 overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <tbody>
              <TdeeRow label="BMR" value={bmrStep ? `${round_calories(bmrStep)} calories` : '-'} />
              <TdeeRow label="Activity multiplier" value={`${multiplierStep}x`} />
              <TdeeRow label="Activity calories" value={activityStep ? `${round_calories(activityStep)} calories` : '-'} />
              <TdeeRow label="Estimated TDEE" value={result ? `${round_calories(result.tdee)} calories/day` : '-'} strong />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function NumberField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">{label}</span>
      <Input min="0" onChange={(event) => onChange(event.target.value)} type="number" value={value} />
    </label>
  )
}

function TdeeRow({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <tr className={strong ? 'bg-primary/10' : 'even:bg-alabaster-grey'}>
      <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">
        {label}
      </th>
      <td className="border-b border-border px-4 py-3 font-medium">{value}</td>
    </tr>
  )
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border bg-alabaster-grey p-4">
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-1 text-base font-medium text-foreground">{value ?? '-'}</dd>
    </div>
  )
}

function getLatestMeasurement(measurements: BodyMeasurementModel[]) {
  return [...measurements].sort((left, right) => (
    right.toJSON().measured_at.localeCompare(left.toJSON().measured_at)
  ))[0] ?? null
}

function parseNumber(value: string) {
  return Number.parseFloat(value)
}

function parseOptionalNumber(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function isValidTdeeInput(input: {
  age: number
  heightCm: number
  weightKg: number
}) {
  return (
    Number.isFinite(input.age)
    && Number.isFinite(input.heightCm)
    && Number.isFinite(input.weightKg)
    && input.age > 0
    && input.heightCm > 0
    && input.weightKg > 0
  )
}
