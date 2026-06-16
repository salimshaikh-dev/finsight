import { useAnalyze } from './hooks/useAnalyze'
import { UploadZone } from './components/UploadZone'
import { StatsRow } from './components/StatsRow'
import { TransactionTable } from './components/TransactionTable'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { CategoryBadge } from './components/CategoryBadge'
import type { Category } from './types'
import { ALL_CATEGORIES } from './types'

// Category spend breakdown helper
function SpendingBreakdown({ transactions }: { transactions: { category: string; amount: number }[] }) {
  const debits = transactions.filter((t) => t.amount < 0)
  const totalSpend = Math.abs(debits.reduce((s, t) => s + t.amount, 0))

  const byCategory = ALL_CATEGORIES.map((cat) => {
    const catDebits = debits.filter((t) => t.category === cat)
    const total = Math.abs(catDebits.reduce((s, t) => s + t.amount, 0))
    return { cat, total, pct: totalSpend > 0 ? (total / totalSpend) * 100 : 0 }
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
      <p className="text-[10px] font-mono tracking-widest text-muted uppercase mb-4">
        Spending by Category
      </p>
      <div className="space-y-3.5">
        {byCategory.map(({ cat, total, pct }) => (
          <div key={cat} className="flex items-center gap-3">
            <div className="w-28 shrink-0">
              <CategoryBadge cat={cat as Category} size="sm" />
            </div>
            <div className="flex-1 bg-bg-raised rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent/60 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-mono text-subtle w-20 text-right shrink-0">
              ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
        {byCategory.length === 0 && (
          <p className="text-sm text-muted font-mono">No debit transactions found.</p>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const { state, analyze, reset } = useAnalyze()

  return (
    <div className="relative z-10 min-h-screen">

      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-accent/40 bg-accent/10
                            flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="font-display font-semibold text-white text-base tracking-tight">
              Fin<span className="text-accent">Sight</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {state.status === 'success' && (
              <button
                onClick={reset}
                className="text-xs font-mono text-muted hover:text-subtle 
                           border border-border rounded-lg px-3 py-1.5 
                           hover:border-border-strong hover:bg-bg-raised transition-all"
              >
                ← New analysis
              </button>
            )}
            <span className="text-[10px] font-mono border border-border-subtle px-2 py-1 
                             rounded text-accent/80 tracking-widest">
              CLAUDE API
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* ── IDLE: Upload screen ──────────────────────────── */}
        {state.status === 'idle' && (
          <UploadZone onFile={analyze} loading={false} />
        )}

        {/* ── LOADING ──────────────────────────────────────── */}
        {state.status === 'loading' && (
          <LoadingState />
        )}

        {/* ── ERROR ────────────────────────────────────────── */}
        {state.status === 'error' && (
          <ErrorState message={state.message} onReset={reset} />
        )}

        {/* ── SUCCESS: Dashboard ───────────────────────────── */}
        {state.status === 'success' && (
          <div className="space-y-6 opacity-0 animate-fade-up"
               style={{ animationFillMode: 'forwards' }}>

            {/* Demo mode banner */}
            {state.data.demo_mode && (
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex gap-3">
                <svg className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-yellow-200 font-semibold">Demo Mode Active</p>
                  <p className="text-xs text-yellow-300 mt-1">
                    No API credits available. Get free credits at{' '}
                    <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-200">
                      console.anthropic.com
                    </a>
                    . {state.data.message && <span>({state.data.message})</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Section label */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 rounded-full bg-accent" />
              <p className="text-[10px] font-mono tracking-widest text-muted uppercase">
                Analysis complete · {state.data.count} transactions found
              </p>
            </div>

            {/* Summary cards */}
            <StatsRow data={state.data} />

            {/* Category breakdown + top debit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SpendingBreakdown transactions={state.data.transactions} />

              {/* Top 5 expenses panel */}
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
                <p className="text-[10px] font-mono tracking-widest text-muted uppercase mb-4">
                  Largest Expenses
                </p>
                <div className="space-y-3">
                  {[...state.data.transactions]
                    .filter((t) => t.amount < 0)
                    .sort((a, b) => a.amount - b.amount)
                    .slice(0, 5)
                    .map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted w-5 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{t.description}</p>
                          <p className="text-[10px] font-mono text-muted">{t.date}</p>
                        </div>
                        <CategoryBadge cat={t.category as Category} size="sm" />
                        <span className="text-sm font-mono text-danger shrink-0">
                          ₹{Math.abs(t.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Transactions table */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-border-strong" />
                <p className="text-[10px] font-mono tracking-widest text-muted uppercase">
                  All Transactions
                </p>
              </div>
              <TransactionTable transactions={state.data.transactions} />
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-16">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between
                        text-[11px] font-mono text-muted">
          <span>FinSight · FastAPI + pdfplumber + Claude API + React</span>
          <span>No data is stored or logged.</span>
        </div>
      </footer>
    </div>
  )
}
