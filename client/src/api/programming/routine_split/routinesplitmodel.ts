import type { RoutineSplitPayload } from './routinesplitschema'

const dayLabels: Record<string, string> = {
  FRIDAY: 'Friday',
  MONDAY: 'Monday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
  THURSDAY: 'Thursday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
}

export class RoutineSplitModel {
  private readonly payload: RoutineSplitPayload

  constructor(payload: RoutineSplitPayload) {
    this.payload = payload
  }

  get routineId() {
    return this.payload.routine_id
  }

  get splitId() {
    return this.payload.split_id
  }

  get order() {
    return this.payload.split_order
  }

  get displayOrder() {
    return `Day ${this.payload.split_order}`
  }

  get dayOfWeek() {
    return this.payload.day_of_week ?? null
  }

  get displayDay() {
    return this.payload.day_of_week ? dayLabels[this.payload.day_of_week] ?? this.payload.day_of_week : this.displayOrder
  }

  toJSON() {
    return this.payload
  }
}
