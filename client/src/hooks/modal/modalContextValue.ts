import { createContext, type ReactNode } from 'react'
import type { ModalOptions, ModalState } from './modalActions'

export interface ModalContextType {
  closeModal: () => void
  isOpen: boolean
  modal: ModalState | null
  openModal: (content: ReactNode, options?: ModalOptions) => void
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)
