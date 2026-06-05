import { useContext } from 'react'
import { DrawerContext } from './drawerContextValue'

export function useDrawer() {
  const ctx = useContext(DrawerContext)

  if (ctx === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider')
  }

  return ctx
}
