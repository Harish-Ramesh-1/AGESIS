import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors duration-200 hover:text-brand-600 dark:hover:text-brand-300">
                  {item.label}
                </Link>
              ) : (
                <span className={clsx(isLast && 'font-semibold text-slate-700 dark:text-slate-200')} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
