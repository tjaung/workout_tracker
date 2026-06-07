import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { userSettingsApi, type ThemeModePayload, type UserSettingsPayload } from '@api/users'
import { DashboardNavbar } from './DashboardNavbar'
import { DashboardSidebar } from './DashboardSidebar'
import { MobileBubbleNav } from './MobileBubbleNav'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [leftHandedMode, setLeftHandedMode] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeModePayload>('dark')

  useEffect(() => {
    let isMounted = true

    userSettingsApi
      .get()
      .then((settings) => {
        if (isMounted) {
          setLeftHandedMode(settings.leftHandedMode)
          setThemeMode(settings.themeMode)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLeftHandedMode(false)
          setThemeMode('dark')
        }
      })

    const handleSettingsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<UserSettingsPayload>).detail
      setLeftHandedMode(detail.left_handed_mode)
      setThemeMode(detail.theme_mode)
    }

    window.addEventListener('user-settings-updated', handleSettingsUpdated)

    return () => {
      isMounted = false
      window.removeEventListener('user-settings-updated', handleSettingsUpdated)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
  }, [themeMode])

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
      <MobileBubbleNav leftHanded={leftHandedMode} />
    </div>
  )
}
