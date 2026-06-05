import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { DrawerOptions, DrawerStackItem } from './drawerActions'
import { DrawerContext } from './drawerContextValue'

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<DrawerStackItem[]>([])
  const [navigationDirection, setNavigationDirection] = useState<'backward' | 'forward' | null>(null)
  const nextStackItemIdRef = useRef(1)

  const pushView = (content: ReactNode, options: DrawerOptions) => {
    setNavigationDirection('forward')
    setStack((current) => [
      ...current,
      {
        content,
        id: nextStackItemIdRef.current++,
        title: options.title,
      },
    ])
  }

  const openDrawer = (content: ReactNode, options: DrawerOptions) => {
    setNavigationDirection(null)
    setStack([
      {
        content,
        id: nextStackItemIdRef.current++,
        title: options.title,
      },
    ])
  }

  const popView = () => {
    setNavigationDirection('backward')
    setStack((current) => current.slice(0, -1))
  }

  const popTo = (index: number) => {
    setNavigationDirection('backward')
    setStack((current) => {
      if (index < 0 || index >= current.length) {
        return current
      }
      return current.slice(0, index + 1)
    })
  }

  const closeDrawer = () => {
    setNavigationDirection(null)
    setStack([])
  }

  const topView = stack[stack.length - 1] ?? null

  const value = useMemo(
    () => ({
      closeDrawer,
      isOpen: stack.length > 0,
      navigationDirection,
      openDrawer,
      popTo,
      popView,
      pushView,
      stack,
      topView,
    }),
    [navigationDirection, stack, topView],
  )

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}
