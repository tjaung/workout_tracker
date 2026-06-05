import type { ReactNode } from 'react'

export interface ModalOptions {
  title?: string
}

export interface ModalState {
  content: ReactNode
  title?: string
}
