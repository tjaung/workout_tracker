import { Input } from '@components/ui/input'

export function NumberField({
  label,
  max,
  min = '0',
  onBlur,
  onChange,
  placeholder,
  value,
}: {
  label: string
  max?: string
  min?: string
  onBlur?: (value: string) => void
  onChange: (value: string) => void
  placeholder?: string
  value: string | number
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">{label}</span>
      <Input
        max={max}
        min={min}
        onBlur={onBlur ? (event) => onBlur(event.target.value) : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="number"
        value={value}
      />
    </label>
  )
}
