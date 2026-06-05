export function formatDate(value?: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDateOnly(value?: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatNumber(value?: number | null, unit = '') {
  if (value === null || value === undefined) {
    return 'Not set'
  }

  return `${value}${unit ? ` ${unit}` : ''}`
}
