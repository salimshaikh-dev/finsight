import type { AnalyzeResponse } from '../types'

interface Props {
  data: AnalyzeResponse
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface StatCardProps {
  label: string
  value: string
  valueClass?: string
  delay?: string
}

function StatCard({ label, value, valueClass = 'text-white', delay = '0ms' }: StatCardProps) {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-xl p-5 opacity-0 animate-fade-up"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <p className="text-[10px] font-mono tracking-widest text-muted uppercase mb-3">{label}</p>
      <p className={`text-2xl font-display font-semibold tracking-tight ${valueClass}`}>{value}</p>
    </div>
  )
}

export function StatsRow({ data }: Props) {
  const totalCredits = data.total_credits ?? 0
  const totalDebits = data.total_debits ?? 0
  const netCashflow = data.net_cashflow ?? 0
  const netPositive = netCashflow >= 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="Total Credits"
        value={`₹${fmt(totalCredits)}`}
        valueClass="text-success"
        delay="0ms"
      />
      <StatCard
        label="Total Debits"
        value={`₹${fmt(totalDebits)}`}
        valueClass="text-danger"
        delay="60ms"
      />
      <StatCard
        label="Net Cashflow"
        value={`${netPositive ? '+' : '-'}₹${fmt(netCashflow)}`}
        valueClass={netPositive ? 'text-success' : 'text-danger'}
        delay="120ms"
      />
      <StatCard
        label="Transactions"
        value={String(data.count)}
        valueClass="text-accent"
        delay="180ms"
      />
      <StatCard
        label="Avg Debit"
        value={data.count > 0
          ? `₹${fmt(totalDebits / data.transactions.filter(t => t.amount < 0).length || 1)}`
          : '—'}
        delay="240ms"
      />
      <StatCard
        label="Currency"
        value={data.currency || 'INR'}
        valueClass="text-subtle"
        delay="300ms"
      />
    </div>
  )
}
