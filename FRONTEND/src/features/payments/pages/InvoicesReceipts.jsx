import { useEffect, useState } from 'react'
import { Download, FileText, Mail, Printer, Receipt as ReceiptIcon } from 'lucide-react'
import { useInvoiceStore } from '../store/invoiceStore'
import { useReceiptStore } from '../store/receiptStore'
import { downloadPdf, printContent } from '../utils/exportUtils'
import PageHeader from '../components/PageHeader'
import SectionHeader from '../components/SectionHeader'
import PaymentSummaryCard from '../components/PaymentSummaryCard'
import InvoiceTable from '../components/InvoiceTable'
import ReceiptTable from '../components/ReceiptTable'
import DocumentPreview from '../components/DocumentPreview'
import DownloadCard from '../components/DownloadCard'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

function DocList({ items, emptyMessage }) {
  if (items.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={`${item.id}-${item.date}`}
          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-slate-700 transition-colors duration-200 hover:bg-white/50 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <span>{item.label}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(item.date)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function InvoicesReceipts() {
  const invoiceStatus = useInvoiceStore((state) => state.status)
  const invoices = useInvoiceStore((state) => state.invoices)
  const fetchInvoices = useInvoiceStore((state) => state.fetchInvoices)
  const invoicePinned = useInvoiceStore((state) => state.pinnedIds)
  const invoiceFavourites = useInvoiceStore((state) => state.favouriteIds)
  const invoiceRecent = useInvoiceStore((state) => state.recentlyDownloaded)

  const receiptStatus = useReceiptStore((state) => state.status)
  const receipts = useReceiptStore((state) => state.receipts)
  const fetchReceipts = useReceiptStore((state) => state.fetchReceipts)
  const receiptPinned = useReceiptStore((state) => state.pinnedIds)
  const receiptFavourites = useReceiptStore((state) => state.favouriteIds)
  const receiptRecent = useReceiptStore((state) => state.recentlyDownloaded)

  const [previewDoc, setPreviewDoc] = useState(null)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([])

  useEffect(() => {
    fetchInvoices()
    fetchReceipts()
  }, [fetchInvoices, fetchReceipts])

  function previewInvoice(invoice) {
    setPreviewDoc({
      type: 'Invoice',
      id: invoice.id,
      label: `${invoice.feeType} Invoice`,
      date: formatDate(invoice.generatedDate),
      amount: formatCurrency(invoice.amount),
    })
  }

  function previewReceipt(receipt) {
    setPreviewDoc({
      type: 'Receipt',
      id: receipt.id,
      label: 'Payment Receipt',
      date: formatDate(receipt.paymentDate),
      amount: formatCurrency(receipt.amount),
      method: receipt.method,
    })
  }

  function toggleSelectInvoice(id) {
    setSelectedInvoiceIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function handleDownloadSelected() {
    invoices
      .filter((invoice) => selectedInvoiceIds.includes(invoice.id))
      .forEach((invoice) => {
        downloadPdf(`${invoice.id}.pdf`, 'Invoice', [
          `Invoice Number: ${invoice.id}`,
          `Amount: ${formatCurrency(invoice.amount)}`,
        ])
      })
  }

  function handleDownloadAll() {
    invoices.forEach((invoice) =>
      downloadPdf(`${invoice.id}.pdf`, 'Invoice', [
        `Invoice Number: ${invoice.id}`,
        `Amount: ${formatCurrency(invoice.amount)}`,
      ]),
    )
    receipts.forEach((receipt) =>
      downloadPdf(`${receipt.id}.pdf`, 'Receipt', [
        `Receipt Number: ${receipt.id}`,
        `Amount: ${formatCurrency(receipt.amount)}`,
      ]),
    )
  }

  function handlePrintAll() {
    printContent('All Documents', [
      ...invoices.map((invoice) => `Invoice ${invoice.id} — ${formatCurrency(invoice.amount)}`),
      ...receipts.map((receipt) => `Receipt ${receipt.id} — ${formatCurrency(receipt.amount)}`),
    ])
  }

  function handleEmailDocuments() {
    window.location.assign(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('My Fee Documents')}`)
  }

  if (invoiceStatus === 'error' || receiptStatus === 'error') {
    return (
      <div>
        <PageHeader title="Invoices & Receipts" description="Your central repository of financial documents." />
        <ErrorState
          message="Couldn't load your documents."
          onRetry={() => {
            fetchInvoices()
            fetchReceipts()
          }}
        />
      </div>
    )
  }

  if (invoiceStatus !== 'success' || receiptStatus !== 'success') {
    return (
      <div>
        <PageHeader title="Invoices & Receipts" description="Your central repository of financial documents." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const pendingInvoices = invoices.filter((invoice) => invoice.status !== 'paid')
  const downloadedCount = invoiceRecent.length + receiptRecent.length

  const allDocuments = [
    ...invoices.map((invoice) => ({
      id: invoice.id,
      type: 'invoice',
      label: `Invoice ${invoice.id}`,
      date: invoice.generatedDate,
    })),
    ...receipts.map((receipt) => ({
      id: receipt.id,
      type: 'receipt',
      label: `Receipt ${receipt.id}`,
      date: receipt.paymentDate,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const pinnedDocuments = allDocuments.filter((document) =>
    (document.type === 'invoice' ? invoicePinned : receiptPinned).includes(document.id),
  )
  const favouriteDocuments = allDocuments.filter((document) =>
    (document.type === 'invoice' ? invoiceFavourites : receiptFavourites).includes(document.id),
  )
  const recentlyDownloaded = [...invoiceRecent, ...receiptRecent]
    .sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt))
    .slice(0, 5)
    .map((item) => ({ id: item.id, label: item.label, date: item.downloadedAt }))

  return (
    <div>
      <PageHeader title="Invoices & Receipts" description="Your central repository of financial documents." />

      <div className="flex flex-col gap-8">
        <section>
          <SectionHeader title="Document Summary" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <PaymentSummaryCard icon={FileText} label="Invoices" value={invoices.length} tone="brand" />
            <PaymentSummaryCard icon={ReceiptIcon} label="Receipts" value={receipts.length} tone="emerald" />
            <PaymentSummaryCard icon={FileText} label="Pending Invoices" value={pendingInvoices.length} tone="amber" />
            <PaymentSummaryCard icon={Download} label="Downloaded Documents" value={downloadedCount} tone="violet" />
          </div>
        </section>

        <section>
          <SectionHeader title="Invoices" />
          <GlassCard hover={false}>
            <InvoiceTable
              invoices={invoices}
              onPreview={previewInvoice}
              selectedIds={selectedInvoiceIds}
              onToggleSelect={toggleSelectInvoice}
            />
          </GlassCard>
        </section>

        <section>
          <SectionHeader title="Receipts" />
          <GlassCard hover={false}>
            <ReceiptTable receipts={receipts} onPreview={previewReceipt} />
          </GlassCard>
        </section>

        <DocumentPreview document={previewDoc} />

        <DownloadCard
          title="Bulk Download"
          actions={[
            {
              label: 'Download Selected',
              icon: Download,
              onClick: handleDownloadSelected,
              disabled: selectedInvoiceIds.length === 0,
            },
            { label: 'Download All', icon: Download, onClick: handleDownloadAll },
            { label: 'Print All', icon: Printer, onClick: handlePrintAll },
            { label: 'Email Documents', icon: Mail, onClick: handleEmailDocuments },
          ]}
        />

        <section>
          <SectionHeader title="Digital Vault" description="Latest, pinned, recently downloaded and favourite documents" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <GlassCard title="Latest Documents">
              <DocList items={allDocuments.slice(0, 5)} emptyMessage="No documents yet." />
            </GlassCard>
            <GlassCard title="Pinned Documents">
              <DocList items={pinnedDocuments} emptyMessage="Pin an invoice or receipt to see it here." />
            </GlassCard>
            <GlassCard title="Recently Downloaded">
              <DocList items={recentlyDownloaded} emptyMessage="Nothing downloaded yet." />
            </GlassCard>
            <GlassCard title="Favourite Documents">
              <DocList items={favouriteDocuments} emptyMessage="Star an invoice or receipt to see it here." />
            </GlassCard>
          </div>
        </section>
      </div>
    </div>
  )
}
