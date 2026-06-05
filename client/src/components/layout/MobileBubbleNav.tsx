import { LogOut, Menu, UserCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@hooks/auth/useAuth'
import { cn } from '@lib/cn'
import { Button } from '@components/ui/button'
import { dashboardNavItems } from './dashboardNav'

const bubbleDelayMs = 45

const arcPositions = [
  '-translate-x-20 -translate-y-24',
  '-translate-x-28 -translate-y-12',
  '-translate-x-28 translate-y-0',
  '-translate-x-24 translate-y-14',
  '-translate-x-14 translate-y-24',
  '-translate-x-4 translate-y-28',
]

export function MobileBubbleNav() {
  const { logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [menuRendered, setMenuRendered] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
      if (openFrameRef.current) {
        window.cancelAnimationFrame(openFrameRef.current)
      }
    }
  }, [])

  const open = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }

    setMenuRendered(true)
    openFrameRef.current = window.requestAnimationFrame(() => setIsOpen(true))
  }

  const close = () => {
    setIsOpen(false)
    setAccountOpen(false)
    closeTimerRef.current = window.setTimeout(
      () => setMenuRendered(false),
      (dashboardNavItems.length + 1) * bubbleDelayMs + 300,
    )
  }

  const toggle = () => {
    if (isOpen) {
      close()
      return
    }

    open()
  }

  return (
    <div className="fixed right-4 top-1/2 z-50 md:hidden">
      <div className="relative">
        {menuRendered ? (
          <>
            <button
              type="button"
              style={{
                transitionDelay: isOpen
                  ? `${dashboardNavItems.length * bubbleDelayMs}ms`
                  : '0ms',
              }}
              className={cn(
                'absolute flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-foreground opacity-0 shadow-md transition-all duration-300 ease-out',
                isOpen
                  ? '-translate-x-10 -translate-y-36 scale-100 opacity-100'
                  : 'translate-x-0 translate-y-0 scale-50 pointer-events-none',
                accountOpen && 'bg-primary text-primary-foreground',
              )}
              aria-label="Open account menu"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <UserCircle className="h-5 w-5" aria-hidden="true" />
            </button>

            {accountOpen ? (
              <div className="absolute right-16 top-[-10rem] w-44 rounded-lg border border-border bg-surface p-2 shadow-md">
                <p className="truncate px-2 py-2 text-xs text-muted">{user?.displayName}</p>
                <Button className="w-full justify-start" size="sm" variant="ghost" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log out
                </Button>
              </div>
            ) : null}

            {dashboardNavItems.map((item, index) => {
              const Icon = item.icon
              const openDelay = (dashboardNavItems.length - 1 - index) * bubbleDelayMs
              const closeDelay = (index + 1) * bubbleDelayMs

              return (
                <Link
                  aria-label={item.label}
                  style={{
                    transitionDelay: `${isOpen ? openDelay : closeDelay}ms`,
                  }}
                  className={cn(
                    'absolute flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-foreground opacity-0 shadow-md transition-all duration-300 ease-out hover:bg-primary hover:text-primary-foreground',
                    isOpen
                      ? `${arcPositions[index]} scale-100 opacity-100`
                      : 'translate-x-0 translate-y-0 scale-50 pointer-events-none',
                  )}
                  key={item.href}
                  to={item.href}
                  onClick={close}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              )
            })}
          </>
        ) : null}

        <button
          type="button"
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-secondary bg-secondary text-secondary-foreground shadow-md"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={toggle}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </div>
  )
}
