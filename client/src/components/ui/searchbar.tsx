import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@lib/cn'

export function Searchbar({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
      <input
        className={cn(
          'h-11 w-full rounded-md border border-border bg-surface py-2 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25',
          className,
        )}
        type="search"
        {...props}
      />
    </div>
  )
}
