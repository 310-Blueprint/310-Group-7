// Wrapper used to display boxes over the page
// used by the Add Application and Filter boxes

import { useId } from 'react'
import useTaskDialog from '../../hooks/useTaskDialog'

function ModalDialog({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = false,
}) {
  const dialogRef = useTaskDialog(isOpen, onClose)
  const titleId = useId()

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

          {/** Optional close button (used for closing the task modal) */}
          {showCloseButton && (
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close dialog"
              className="absolute right-4 top-11 z-30 flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:right-5 sm:top-14"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          <div className="relative z-10 -mt-1 rounded-3xl bg-brand-black px-5 pb-6 pt-12 font-sans shadow-2xl sm:-mt-2 sm:rounded-[28px] sm:p-8 sm:pb-9 sm:pt-16">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default ModalDialog
