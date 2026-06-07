import { Input } from '@components/ui/input'

export function DateField({
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
      <Input onChange={(event) => onChange(event.target.value)} type="date" value={value} />
    </label>
  )
}
