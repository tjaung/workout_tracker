export function makeOptions(
  values: Array<{ label: string; value: string }>,
  emptyLabel: string,
) {
  const seen = new Set<string>()
  const options = values
    .filter((option) => {
      const normalizedValue = option.value.trim()
      if (!normalizedValue || seen.has(normalizedValue)) {
        return false
      }
      seen.add(normalizedValue)
      return true
    })
    .sort((first, second) => first.label.localeCompare(second.label))

  return [{ label: emptyLabel, value: '' }, ...options]
}

export function parseNumber(value: string) {
  return Number.parseFloat(value)
}

export function parseOptionalInteger(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseOptionalNumber(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}
