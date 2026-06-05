import { useContext } from 'react'
import { ModalContext } from './modalContextValue'

export function useModal() {
  const ctx = useContext(ModalContext)
  if (ctx === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return ctx
}
