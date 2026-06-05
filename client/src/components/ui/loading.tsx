import { cn } from '@lib/cn'
import { DeadliftIcon } from './icons'

type LoadingSize = 'sm' | 'md' | 'lg'

interface LoadingProps {
  className?: string
  fullPage?: boolean
  label?: string
  size?: LoadingSize
}

const sizeClasses: Record<LoadingSize, string> = {
  sm: 'w-20',
  md: 'w-28',
  lg: 'w-40',
}

export function Loading({ className, fullPage = false, label = 'Loading', size = 'md' }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-foreground',
        fullPage && 'fixed inset-0 z-[120] bg-background/95 p-6',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <DeadliftIcon className={sizeClasses[size]} />

      <span className="text-sm font-medium text-muted">{label}</span>
    </div>
  )
}
