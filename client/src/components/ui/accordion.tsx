import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@lib/cn'

export function Accordion({
  children,
  className,
  title,
}: {
  children: ReactNode
  className?: string
  title: string
}) {
  return (
    <details className={cn('group border-t border-border', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-foreground outline-none transition-colors hover:bg-primary/10 focus-visible:bg-primary/10">
        <span>{title}</span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  )
}
