import { Link, useLocation } from 'react-router-dom'
import { cn } from '@lib/cn'
import type { DashboardNavItem } from './dashboardNav'

interface SidebarLinkProps {
  collapsed?: boolean
  item: DashboardNavItem
}

export function SidebarLink({ collapsed = false, item }: SidebarLinkProps) {
  const location = useLocation()
  const isActive =
    item.href === '/dashboard'
      ? location.pathname === item.href
      : location.pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      aria-label={item.label}
      className={cn(
        'group flex h-11 items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:border-border hover:bg-surface-muted',
        collapsed && 'justify-center px-0',
      )}
      to={item.href}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span
        className={cn(
          'truncate transition-[opacity,width] duration-200',
          collapsed && 'w-0 opacity-0',
        )}
      >
        {item.label}
      </span>
    </Link>
  )
}
