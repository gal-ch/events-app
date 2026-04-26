import type { Event, SortState } from '@events/types'
import { StatusBadge } from '../StatusBadge'
import { SortableHeader } from './SortableHeader'

interface Props {
  events: Event[]
  sort: SortState
  onSort: (field: SortState['sortBy']) => void
  isLoading: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function EventsTable({ events, sort, onSort, isLoading }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <SortableHeader label="Title" field="title" sort={sort} onSort={onSort} />
            <SortableHeader label="Category" field="category" sort={sort} onSort={onSort} />
            <SortableHeader label="Location" field="location" sort={sort} onSort={onSort} />
            <SortableHeader label="Status" field="status" sort={sort} onSort={onSort} />
            <SortableHeader label="Start" field="startDate" sort={sort} onSort={onSort} />
            <SortableHeader label="Capacity" field="capacity" sort={sort} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {events.length === 0 && !isLoading && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                No events match your filters.
              </td>
            </tr>
          )}
          {events.map((e) => (
            <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">{e.title}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{e.category}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{e.location}</td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={e.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{formatDate(e.startDate)}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{e.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {isLoading && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          Loading…
        </div>
      )}
    </div>
  )
}
