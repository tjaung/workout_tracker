import { createContext, type ReactNode } from 'react'
import type { DrawerOptions, DrawerStackItem } from './drawerActions'

export interface DrawerContextType {
  closeDrawer: () => void
  isOpen: boolean
  navigationDirection: 'backward' | 'forward' | null
  openDrawer: (content: ReactNode, options: DrawerOptions) => void
  popTo: (index: number) => void
  popView: () => void
  pushView: (content: ReactNode, options: DrawerOptions) => void
  stack: DrawerStackItem[]
  topView: DrawerStackItem | null
}

export const DrawerContext = createContext<DrawerContextType | undefined>(undefined)
