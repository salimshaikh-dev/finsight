import { useState, useMemo } from 'react'
import type { Transaction, Category } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { ExportButton } from './ExportButton'
import { ALL_CATEGORIES } from '../types'

interface Props {
  transactions: Transaction[]
}

export function TransactionTable({ transactions }: Props) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return transactions.filter((t) => {
      const matchesSearch =
        !q ||
        t.description.toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      const matchesCategory = !categoryFilter || t.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [transactions, search, categoryFilter])

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">

      {/* Table toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border-subtle bg-bg-raised">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm font-mono text-white 
                       placeholder:text-muted outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | '')}
            className="bg-bg-surface border border-border text-xs font-mono text-subtle 
                       rounded-lg px-2.5 py-1.5 outline-none hover:border-border-strong 
                       focus:border-accent transition-colors cursor-pointer"
          >
            <option value="">All categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <span className="text-[10px] font-mono text-muted hidden sm:block">
            {filtered.length} / {transactions.length}
          </span>

          <ExportButton transactions={filtered} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Date', 'Description', 'Category', 'Amount'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-mono tracking-widest 
                             text-muted uppercase font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted font-mono">
                  No transactions match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((t, i) => (
                <tr
                  key={i}
                  className="border-b border-border-subtle/50 hover:bg-bg-hover transition-colors"
                >
                  <td className="px-5 py-3.5 text-xs font-mono text-muted whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-300 max-w-xs truncate">
                    {t.description}
                  </td>
                  <td className="px-5 py-3.5">
                    <CategoryBadge cat={t.category} />
                  </td>
                  <td className={`px-5 py-3.5 text-right font-mono font-medium whitespace-nowrap
                    ${t.amount > 0 ? 'text-success' : 'text-danger'}`}>
                    {t.amount > 0 ? '+' : ''}
                    {t.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
