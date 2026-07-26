import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useSupportStore } from '../store/supportStore'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import PageHeaderSimple from '../components/PageHeaderSimple'
import FaqAccordion from '../components/FaqAccordion'
import TicketForm from '../components/TicketForm'
import TicketList from '../components/TicketList'
import ContactInfoCard from '../components/ContactInfoCard'

export default function Support() {
  const status = useSupportStore((state) => state.status)
  const error = useSupportStore((state) => state.error)
  const faqs = useSupportStore((state) => state.faqs)
  const tickets = useSupportStore((state) => state.tickets)
  const submitStatus = useSupportStore((state) => state.submitStatus)
  const fetchAll = useSupportStore((state) => state.fetchAll)
  const searchFaqs = useSupportStore((state) => state.searchFaqs)
  const submitTicket = useSupportStore((state) => state.submitTicket)

  const [faqQuery, setFaqQuery] = useState('')

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status !== 'success') return
    const timeout = setTimeout(() => {
      searchFaqs(faqQuery)
    }, 250)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faqQuery])

  async function handleSubmitTicket(payload) {
    const ticket = await submitTicket(payload)
    return Boolean(ticket)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Support" />

      <div aria-live="polite" className="sr-only">
        {submitStatus === 'success' ? 'Ticket submitted successfully.' : ''}
      </div>

      {status === 'error' && <ErrorState message={error} onRetry={fetchAll} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
            />
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={faqQuery}
                onChange={(event) => setFaqQuery(event.target.value)}
                placeholder="Search FAQs"
                aria-label="Search FAQs"
                className="w-full rounded-clay border border-white/50 bg-white/50 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            {status === 'loading' ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12" />
                ))}
              </div>
            ) : (
              <FaqAccordion faqs={faqs} />
            )}
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
            />
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Raise a Ticket</h2>
            <TicketForm onSubmit={handleSubmitTicket} isSubmitting={submitStatus === 'loading'} />
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
            />
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Your Tickets</h2>
            {status === 'loading' ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16" />
                ))}
              </div>
            ) : (
              <TicketList tickets={tickets} />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <ContactInfoCard />
        </div>
      </div>
    </div>
  )
}
