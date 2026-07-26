import { AlertTriangle } from 'lucide-react'
import { GlassButton } from '../Button'

export default function ErrorState({ message = "Something went wrong. Please try again.", onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-clay border border-red-100 bg-red-50/60 px-5 py-8 text-center dark:border-red-500/20 dark:bg-red-500/10"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <GlassButton onClick={onRetry} className="mt-1">
          Try again
        </GlassButton>
      )}
    </div>
  )
}
