import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@components/ui/button'
import { dashboardNavItems } from './dashboardNav'
import { SidebarLink } from './SidebarLink'

interface DashboardSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  return (
    <aside
      className={[
        'sticky top-0 hidden h-svh shrink-0 border-r border-border bg-surface transition-[width] duration-200 md:block',
        collapsed ? 'w-20' : 'w-64',
      ].join(' ')}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className={collapsed ? 'sr-only' : 'min-w-0'}>
          <p className="truncate text-sm font-semibold">Workout Tracker</p>
        </div>
        <Button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="h-9 w-9 shrink-0 p-0"
          size="sm"
          variant="ghost"
          onClick={onToggle}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {dashboardNavItems.map((item) => (
          <SidebarLink collapsed={collapsed} item={item} key={item.href} />
        ))}
      </nav>
    </aside>
  )
}
