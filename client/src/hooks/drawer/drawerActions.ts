import type { ReactNode } from 'react'

export interface DrawerOptions {
  title: string
}

export interface DrawerStackItem {
  content: ReactNode
  id: number
  title: string
}
