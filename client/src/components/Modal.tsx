import { useEffect, useRef, useState } from 'react'
import { useModal } from '@hooks/modal/useModal'

function Modal() {
  const { closeModal, modal } = useModal()
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleRequestClose = () => {
    if (isClosing) {
      return
    }

    setIsClosing(true)
    closeTimeoutRef.current = window.setTimeout(() => {
      closeModal()
      setIsClosing(false)
      closeTimeoutRef.current = null
    }, 200)
  }

  if (!modal) {
    return null
  }

  return (
    <div
      className={[
        'fixed inset-0 z-[140] flex items-center justify-center bg-[rgb(6_20_20_/_0.45)] p-3 sm:p-4 lg:p-6',
        isClosing ? 'modal-overlay-exit' : 'modal-overlay-enter',
      ].join(' ')}
      role="presentation"
      onClick={handleRequestClose}
    >
      <div
        className={[
          'relative flex max-h-[min(90vh,56rem)] w-full max-w-[min(92vw,38rem)] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-md',
          isClosing ? 'modal-panel-exit' : 'modal-panel-enter',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={modal.title ?? 'Modal'}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted text-foreground transition-colors hover:border-secondary"
          aria-label="Close modal"
          onClick={handleRequestClose}
        >
          x
        </button>
        {modal.title ? (
          <header className="border-b border-border px-4 py-4 sm:px-6">
            <h2 className="m-0 text-lg font-semibold text-foreground">
              {modal.title}
            </h2>
          </header>
        ) : null}
        <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {modal.content}
        </div>
      </div>
    </div>
  )
}

export default Modal
