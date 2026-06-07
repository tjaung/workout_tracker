export type BiologicalSex = 'female' | 'male'
export type ActivityLevel = 'light' | 'moderate' | 'heavy'

export type TdeeInput = {
  activityLevel: ActivityLevel
  age: number
  heightCm: number
  sex: BiologicalSex
  weightKg: number
}

export type TdeeResult = {
  activityCalories: number
  bmr: number
  multiplier: number
  tdee: number
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  heavy: 1.725,
  light: 1.375,
  moderate: 1.55,
}

export function get_bmr({ age, heightCm, sex, weightKg }: Omit<TdeeInput, 'activityLevel'>) {
  const sexAdjustment = sex === 'male' ? 5 : -161
  return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + sexAdjustment
}

export function get_activity_multiplier(activityLevel: ActivityLevel) {
  return ACTIVITY_MULTIPLIERS[activityLevel]
}

export function get_activity_calories(bmr: number, multiplier: number) {
  return bmr * multiplier - bmr
}

export function get_tdee(input: TdeeInput): TdeeResult {
  const bmr = get_bmr(input)
  const multiplier = get_activity_multiplier(input.activityLevel)
  const activityCalories = get_activity_calories(bmr, multiplier)
  return {
    activityCalories,
    bmr,
    multiplier,
    tdee: bmr + activityCalories,
  }
}

export function round_calories(value: number) {
  return Math.round(value)
}
