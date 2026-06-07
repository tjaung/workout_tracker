import type { ReactNode } from 'react'
import { cn } from '@lib/cn'

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('rounded-md border border-border bg-alabaster-grey px-2 py-1', className)}>
      {children}
    </span>
  )
}
