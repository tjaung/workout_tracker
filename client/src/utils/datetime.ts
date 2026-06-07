export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function calculateAge(dateOfBirth: string, currentDate = new Date()) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) {
    return null
  }

  let age = currentDate.getFullYear() - birthDate.getFullYear()
  const monthDelta = currentDate.getMonth() - birthDate.getMonth()
  const hasNotHadBirthdayThisYear = (
    monthDelta < 0
    || (monthDelta === 0 && currentDate.getDate() < birthDate.getDate())
  )

  if (hasNotHadBirthdayThisYear) {
    age -= 1
  }

  return age > 0 ? age : null
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatMonth(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getCalendarDays(month: Date) {
  const firstDay = startOfMonth(month)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      date,
      isCurrentMonth: date.getMonth() === month.getMonth(),
    }
  })
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function toDateTimeLocalValue(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}
