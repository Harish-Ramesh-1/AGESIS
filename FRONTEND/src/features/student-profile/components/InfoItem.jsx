export default function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">{value ?? '—'}</dd>
    </div>
  )
}
