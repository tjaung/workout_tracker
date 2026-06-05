import type { RoutineDetailModel } from '@api/programming/routine'

export type FilterOption = {
  label: string
  value: string
}

export const routineTypeOptions = [
  { label: 'Any type', value: '' },
  { label: 'Cardio', value: 'CARDIO' },
  { label: 'Weight training', value: 'WEIGHT_TRAINING' },
  { label: 'Mobility', value: 'MOBILITY' },
]

export const goalOptions = [
  { label: 'Any goal', value: '' },
  { label: 'Weight loss', value: 'WEIGHT_LOSS' },
  { label: 'Muscle growth', value: 'MUSCLE_GROWTH' },
  { label: 'Strength', value: 'STRENGTH' },
  { label: 'Endurance', value: 'ENDURANCE' },
  { label: 'Flexibility', value: 'FLEXIBILITY' },
]

export const daysPerWeekOptions = [
  { label: 'Any days', value: '' },
  { label: '1 day', value: '1' },
  { label: '2 days', value: '2' },
  { label: '3 days', value: '3' },
  { label: '4 days', value: '4' },
  { label: '5 days', value: '5' },
  { label: '6+ days', value: '6' },
]

export const intensityOptions = [
  { label: 'Any intensity', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Moderate', value: 'MODERATE' },
  { label: 'High', value: 'HIGH' },
]

export function filterRoutines({
  daysPerWeek,
  goal,
  intensity,
  routineType,
  routines,
  search,
}: {
  daysPerWeek: string
  goal: string
  intensity: string
  routineType: string
  routines: RoutineDetailModel[]
  search: string
}) {
  const normalizedSearch = search.trim().toLowerCase()
  const selectedDays = daysPerWeek ? Number(daysPerWeek) : null

  return routines.filter((routine) => {
    const matchesSearch = normalizedSearch
      ? routine.name.toLowerCase().includes(normalizedSearch)
      : true
    const matchesType = routineType ? routine.routineType === routineType : true
    const matchesGoal = goal ? routine.goal === goal : true
    const matchesDays = selectedDays
      ? selectedDays === 6
        ? routine.daysPerWeek >= 6
        : routine.daysPerWeek === selectedDays
      : true
    const matchesIntensity = intensity ? routine.intensity === intensity : true

    return matchesSearch && matchesType && matchesGoal && matchesDays && matchesIntensity
  })
}
