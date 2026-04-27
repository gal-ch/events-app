import type { FilterState } from '@events/types'
import { FilterSelect } from './FilterSelect'

const STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']
const CATEGORIES = ['Music', 'Tech', 'Sports', 'Art', 'Food', 'Business', 'Education']

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
}

export function FilterBar({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        placeholder="Search title or location…"
        className="w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <FilterSelect
        label="Status"
        options={STATUSES}
        value={value.status}
        onChange={(v) => onChange({ ...value, status: v })}
      />

      <FilterSelect
        label="Category"
        options={CATEGORIES}
        value={value.category}
        onChange={(v) => onChange({ ...value, category: v })}
      />

      {(value.search || value.status || value.category) && (
        <button
          type="button"
          onClick={() => onChange({ search: '', status: '', category: '' })}
          className="text-sm text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  )
}
