import type { Category } from '../types'

interface Props {
  cat: Category
  size?: 'sm' | 'md'
}

const CATEGORY_STYLES: Record<Category, string> = {
  Salary:        'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Rent:          'bg-violet-500/15 text-violet-400 border-violet-500/20',
  Food:          'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Software:      'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Transport:     'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Utilities:     'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  Healthcare:    'bg-rose-500/15 text-rose-400 border-rose-500/20',
  Entertainment: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Transfers:     'bg-slate-500/15 text-slate-400 border-slate-500/20',
  Other:         'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
}

export function CategoryBadge({ cat, size = 'sm' }: Props) {
  const style = CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.Other
  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1'

  return (
    <span className={`inline-block font-mono border rounded font-medium tracking-wide ${style} ${sizeClass}`}>
      {cat}
    </span>
  )
}
