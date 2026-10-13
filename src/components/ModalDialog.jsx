// Wrapper used to display boxes over the page
// used by the Add Application and Filter boxes

import { useEffect, useId, useRef } from 'react'

function ModalDialog({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function handleNativeClose() {
      onClose?.()
    }

    dialog.addEventListener('close', handleNativeClose)
    return () => dialog.removeEventListener('close', handleNativeClose)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="h-full max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-white/55"
    >
      <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:p-6">
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
          className="absolute inset-0 cursor-default bg-transparent"
        />

        <div className="relative w-full max-w-120">
          <div className="relative z-20 flex items-center justify-center">
            <h2
              id={titleId}
              className="text-center text-3xl font-bold tracking-tight text-brand-black sm:text-5xl"
            >
              {title}
            </h2>
          </div>

          <div className="relative z-10 -mt-1 rounded-3xl bg-brand-black px-5 pb-6 pt-12 font-sans shadow-2xl sm:-mt-2 sm:rounded-[28px] sm:p-8 sm:pb-9 sm:pt-16">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default ModalDialog
