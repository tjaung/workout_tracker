import { useEffect, useRef, useState } from 'react'
import { useDrawer } from '@hooks/drawer/useDrawer'

function Drawer() {
  const { closeDrawer, isOpen, navigationDirection, topView } = useDrawer()
  const [isClosing, setIsClosing] = useState(false)
  const [displayView, setDisplayView] = useState(topView)
  const [exitingView, setExitingView] = useState<typeof topView>(null)
  const [isTransitioningView, setIsTransitioningView] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)
  const viewTransitionTimeoutRef = useRef<number | null>(null)
  const previousTopViewRef = useRef(topView)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current)
      }

      if (viewTransitionTimeoutRef.current !== null) {
        window.clearTimeout(viewTransitionTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const previousTopView = previousTopViewRef.current

    if (!topView) {
      setDisplayView(null)
      setExitingView(null)
      setIsTransitioningView(false)
      previousTopViewRef.current = topView
      return
    }

    if (!previousTopView || previousTopView.id === topView.id || !navigationDirection) {
      setDisplayView(topView)
      setExitingView(null)
      setIsTransitioningView(false)
      previousTopViewRef.current = topView
      return
    }

    setExitingView(previousTopView)
    setDisplayView(topView)
    setIsTransitioningView(true)

    if (viewTransitionTimeoutRef.current !== null) {
      window.clearTimeout(viewTransitionTimeoutRef.current)
    }

    viewTransitionTimeoutRef.current = window.setTimeout(() => {
      setExitingView(null)
      setIsTransitioningView(false)
      viewTransitionTimeoutRef.current = null
    }, 260)

    previousTopViewRef.current = topView
  }, [navigationDirection, topView])

  const handleRequestClose = () => {
    if (isClosing) {
      return
    }

    setIsClosing(true)
    closeTimeoutRef.current = window.setTimeout(() => {
      closeDrawer()
      setIsClosing(false)
      closeTimeoutRef.current = null
    }, 220)
  }

  if (!isOpen || !topView) {
    return null
  }

  const drawerHeaderTitle = topView.title

  return (
    <div
      className={[
        'fixed inset-0 z-[110] flex justify-end bg-overlay',
        isClosing ? 'drawer-overlay-exit' : 'drawer-overlay-enter',
      ].join(' ')}
      role="presentation"
      onClick={handleRequestClose}
    >
      <aside
        className={[
          'flex h-full w-full flex-col border-l border-border bg-surface shadow-md',
          'md:w-[60vw]',
          isClosing ? 'drawer-panel-exit' : 'drawer-panel-enter',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={drawerHeaderTitle}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="m-0 truncate text-xl font-semibold text-foreground">
              {drawerHeaderTitle}
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-foreground transition-colors hover:border-secondary"
            aria-label="Close drawer"
            onClick={handleRequestClose}
          >
            x
          </button>
        </header>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {exitingView ? (
            <div
              className={[
                'absolute inset-0 h-full overflow-y-auto overscroll-contain px-6 pb-6',
                navigationDirection === 'forward'
                  ? 'drawer-view-exit-left'
                  : 'drawer-view-exit-right',
              ].join(' ')}
            >
              {exitingView.content}
            </div>
          ) : null}

          <div
            className={[
              'h-full min-h-0 overflow-y-auto overscroll-contain px-6 pb-6',
              isTransitioningView
                ? navigationDirection === 'forward'
                  ? 'drawer-view-enter-right'
                  : 'drawer-view-enter-left'
                : '',
            ].join(' ')}
          >
            {displayView?.content}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Drawer
