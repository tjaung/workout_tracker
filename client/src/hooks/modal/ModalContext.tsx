import {
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ModalOptions, ModalState } from './modalActions'
import { ModalContext } from './modalContextValue'

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  const openModal = (content: ReactNode, options?: ModalOptions) => {
    setModal({
      content,
      title: options?.title,
    })
  }

  const closeModal = () => {
    setModal(null)
  }

  const value = useMemo(
    () => ({
      closeModal,
      isOpen: modal !== null,
      modal,
      openModal,
    }),
    [modal],
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}
