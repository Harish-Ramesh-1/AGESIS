import { useEffect, useRef } from 'react'
import clsx from 'clsx'

const SWIPE_CLOSE_THRESHOLD = 60

export default function MobileNavSheet({ isOpen, onClose, title, children }) {
  const touchStartY = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function handleTouchStart(event) {
    touchStartY.current = event.touches[0].clientY
  }

  function handleTouchMove(event) {
    if (touchStartY.current === null) return
    const delta = event.touches[0].clientY - touchStartY.current
    if (delta > SWIPE_CLOSE_THRESHOLD) {
      onClose()
      touchStartY.current = null
    }
  }

  function handleTouchEnd() {
    touchStartY.current = null
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={clsx(
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-premium md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={clsx(
          'fixed inset-x-3 bottom-3 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-clay border border-white/50 bg-white/30 shadow-glass backdrop-blur-2xl transition-transform duration-300 ease-premium dark:border-white/10 dark:bg-white/[0.06] md:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+2rem)]',
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        />
        <div className="flex shrink-0 flex-col items-center pb-2 pt-3">
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        </div>
        <div className="thin-scrollbar overflow-y-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-1">
          {children}
        </div>
      </div>
    </>
  )
}
