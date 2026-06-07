import { cn } from '@lib/cn'

export function InfoItem({
  className,
  label,
  value,
  valueClassName,
}: {
  className?: string
  label: string
  value?: string | null
  valueClassName?: string
}) {
  return (
    <div className={cn('rounded-md border border-border bg-alabaster-grey p-3', className)}>
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className={cn('mt-1 text-sm font-medium text-foreground', valueClassName)}>{value ?? '-'}</dd>
    </div>
  )
}
