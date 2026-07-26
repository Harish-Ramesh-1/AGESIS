export default function DataTable({ columns, rows, keyField = 'id', emptyMessage = 'No records found.' }) {
  if (!rows.length) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
  }

  return (
    <div className="thin-scrollbar overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 dark:border-white/10">
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[keyField]}
              className="border-b border-slate-100/80 transition-colors duration-200 ease-premium last:border-0 hover:bg-white/40 dark:border-white/5 dark:hover:bg-white/[0.03]"
            >
              {columns.map((column) => (
                <td key={column.key} className="whitespace-nowrap px-3 py-3 text-slate-700 dark:text-slate-200">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
