import { cn } from '@/shared/utils/cn'
import type { SortState } from '@events/types'

interface Props {
  label: string
  field: SortState['sortBy']
  sort: SortState
  onSort: (field: SortState['sortBy']) => void
}

export function SortableHeader({ label, field, sort, onSort }: Props) {
  const active = sort.sortBy === field
  const arrow = active ? (sort.sortOrder === 'asc' ? '▲' : '▼') : ''

  return (
    <th
      onClick={() => onSort(field)}
      className={cn(
        'cursor-pointer select-none px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600',
        'hover:bg-slate-100',
        active && 'text-slate-900',
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-[10px]">{arrow}</span>
      </span>
    </th>
  )
}
