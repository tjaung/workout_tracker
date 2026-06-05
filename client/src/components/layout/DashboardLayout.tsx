import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardNavbar } from './DashboardNavbar'
import { DashboardSidebar } from './DashboardSidebar'
import { MobileBubbleNav } from './MobileBubbleNav'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />
        <div className="min-w-0 flex-1">
          <DashboardNavbar />
          <main className="min-h-svh p-4 pb-28 md:min-h-[calc(100svh-4rem)] md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileBubbleNav />
    </div>
  )
}
