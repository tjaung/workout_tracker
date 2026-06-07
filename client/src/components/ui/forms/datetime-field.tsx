import { Input } from '@components/ui/input'

export function DateTimeField({
  className = '',
  label,
  onChange,
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`.trim()}>
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">{label}</span>
      <Input onChange={(event) => onChange(event.target.value)} type="datetime-local" value={value} />
    </label>
  )
}
