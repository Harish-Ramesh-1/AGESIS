import { ChevronDown, HelpCircle } from 'lucide-react'
import EmptyState from '../../../../components/common/EmptyState'

export default function FaqAccordion({ faqs }) {
  if (faqs.length === 0) {
    return <EmptyState icon={HelpCircle} title="No matching questions" description="Try a different search term." />
  }

  return (
    <div className="flex flex-col gap-2">
      {faqs.map((faq) => (
        <details key={faq.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{faq.question}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="mt-2 border-t border-slate-200/70 pt-2 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}
