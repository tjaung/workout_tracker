import { Input } from '@components/ui/input'

export function TextField({
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
