import { LogOut } from 'lucide-react'
import { useAuth } from '@hooks/auth/useAuth'
import { Button } from '@components/ui/button'

export function DashboardNavbar() {
  const { logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur md:flex">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Dashboard</p>
        <p className="truncate text-sm font-medium text-foreground">{user?.displayName}</p>
      </div>
      <Button size="sm" variant="outline" onClick={() => void logout()}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Log out
      </Button>
    </header>
  )
}
