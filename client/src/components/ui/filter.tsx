export interface FilterOption {
  label: string
  value: string
}

export function Filter({
  className = '',
  label,
  onChange,
  options,
  size = 'md',
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  options: FilterOption[]
  size?: 'sm' | 'md'
  value: string
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-tertiary">
        {label}
      </span>
      <select
        className={`${size === 'sm' ? 'h-10' : 'h-11'} w-full cursor-pointer rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option
            key={option.value || option.label}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
