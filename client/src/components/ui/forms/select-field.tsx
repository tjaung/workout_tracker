export function SelectField({
  className = '',
  label,
  onChange,
  options,
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`.trim()}>
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">{label}</span>
      <select
        className="h-10 w-full cursor-pointer rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}
