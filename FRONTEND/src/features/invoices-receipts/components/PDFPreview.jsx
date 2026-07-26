import { useState } from 'react'
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import clsx from 'clsx'
import InvoicePreview from './InvoicePreview'
import ReceiptPreview from './ReceiptPreview'

const ZOOM_STEPS = [75, 100, 125, 150]

export default function PDFPreview({ documentType, data }) {
  const [zoomIndex, setZoomIndex] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const zoom = ZOOM_STEPS[zoomIndex]

  return (
    <div className={clsx(isFullscreen && 'fixed inset-0 z-[60] flex flex-col bg-slate-900/80 p-4 backdrop-blur-sm')}>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomIndex((prev) => Math.max(0, prev - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-12 text-center text-xs font-medium text-slate-600 dark:text-slate-300">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoomIndex((prev) => Math.min(ZOOM_STEPS.length - 1, prev + 1))}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">Page 1 of 1</span>
        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      <div className={clsx('thin-scrollbar overflow-auto rounded-xl bg-slate-100 p-6 dark:bg-slate-950/40', isFullscreen && 'flex-1')}>
        <div style={{ width: `${zoom}%`, transition: 'width 200ms ease' }} className="mx-auto min-w-[320px] max-w-3xl">
          {documentType === 'invoice' ? <InvoicePreview invoice={data} showActions={false} /> : <ReceiptPreview receipt={data} showActions={false} />}
        </div>
      </div>
    </div>
  )
}
