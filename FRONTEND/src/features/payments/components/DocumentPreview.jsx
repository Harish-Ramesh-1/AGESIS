import { useState } from 'react'
import { FileText, Maximize2, Minimize2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import GlassCard from '../../../components/common/GlassCard'
import EmptyState from '../../../components/common/EmptyState'

export default function DocumentPreview({ document }) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!document) {
    return (
      <GlassCard title="Document Preview" hover={false}>
        <EmptyState
          icon={FileText}
          title="No document selected"
          description="Choose an invoice or receipt to preview it here."
        />
      </GlassCard>
    )
  }

  const paper = (
    <div className="flex h-full flex-col items-center justify-center overflow-auto bg-white/70 p-10 dark:bg-slate-900/40">
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-left shadow-lg transition-transform duration-200 ease-premium dark:border-white/10 dark:bg-slate-800"
        style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {document.type}
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{document.label}</h3>
        <div className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <p>Document No: {document.id}</p>
          <p>Date: {document.date}</p>
          <p>Amount: {document.amount}</p>
          {document.method && <p>Method: {document.method}</p>}
        </div>
      </div>
    </div>
  )

  const controls = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setZoom((value) => Math.max(50, value - 10))}
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <ZoomOut className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-10 text-center text-xs text-slate-500 dark:text-slate-400">{zoom}%</span>
      <button
        type="button"
        onClick={() => setZoom((value) => Math.min(150, value + 10))}
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <ZoomIn className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setRotation((value) => (value + 90) % 360)}
        aria-label="Rotate"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <RotateCw className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setIsFullscreen(true)}
        aria-label="Fullscreen"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <Maximize2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )

  return (
    <>
      <GlassCard title="Document Preview" hover={false} action={controls}>
        <div className="h-72 overflow-hidden rounded-xl">{paper}</div>
      </GlassCard>

      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${document.label} preview`}
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between p-4">
            {controls}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Exit fullscreen"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors duration-200 hover:bg-white/10"
            >
              <Minimize2 className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">{paper}</div>
        </div>
      )}
    </>
  )
}
