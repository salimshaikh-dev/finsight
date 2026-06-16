export type Category =
  | 'Salary'
  | 'Rent'
  | 'Food'
  | 'Software'
  | 'Transport'
  | 'Utilities'
  | 'Healthcare'
  | 'Entertainment'
  | 'Transfers'
  | 'Other'

export interface Transaction {
  date: string
  description: string
  category: Category
  amount: number
}

export interface AnalyzeResponse {
  transactions: Transaction[]
  count: number
  total_credits?: number
  total_debits?: number
  net_cashflow?: number
  currency?: string
  statement_period?: string | null
  demo_mode?: boolean
  message?: string
}

// Discriminated union for the analysis state machine
export type AnalyzeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AnalyzeResponse }
  | { status: 'error'; message: string }

export const ALL_CATEGORIES: Category[] = [
  'Salary', 'Rent', 'Food', 'Software', 'Transport',
  'Utilities', 'Healthcare', 'Entertainment', 'Transfers', 'Other',
]
