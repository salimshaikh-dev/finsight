import type { Transaction } from '../types'

interface Props {
  transactions: Transaction[]
}

export function ExportButton({ transactions }: Props) {
  const handleExport = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount']
    const rows = transactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`, // escape quotes in descriptions
      t.category,
      t.amount.toFixed(2),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      disabled={transactions.length === 0}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border 
                 rounded-lg text-subtle hover:text-white hover:border-border-strong 
                 hover:bg-bg-raised transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export CSV
    </button>
  )
}
