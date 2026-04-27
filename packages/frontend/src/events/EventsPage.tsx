import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { FilterState, SortState } from '@events/types'
import { fetchEvents } from './services/api'
import { EventsTable } from './components/EventsTable/EventsTable'
import { FilterBar } from './components/FilterBar/FilterBar'
import { Pagination } from './components/Pagination/Pagination'

export function EventsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState<SortState>({ sortBy: 'startDate', sortOrder: 'desc' })
  const [filters, setFilters] = useState<FilterState>({ search: '', status: '', category: '' })

  const params = useMemo(
    () => ({
      page,
      pageSize,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      status: filters.status || undefined,
      category: filters.category || undefined,
      search: filters.search || undefined,
    }),
    [page, pageSize, sort.sortBy, sort.sortOrder, filters.status, filters.category, filters.search],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    placeholderData: keepPreviousData,
  })

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleSort = (field: SortState['sortBy']) => {
    setPage(1)
    setSort((prev) =>
      prev.sortBy === field
        ? { sortBy: field, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }
        : { sortBy: field, sortOrder: 'asc' },
    )
  }

  const handleFiltersChange = (next: FilterState) => {
    setPage(1)
    setFilters(next)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Events</h1>
        <p className="text-sm text-slate-600">
          Reading directly from PostgREST at <code>localhost:3010</code>.
        </p>
      </header>

      <FilterBar value={filters} onChange={handleFiltersChange} />

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {(error as Error).message}
        </div>
      )}

      <EventsTable
        events={data?.data ?? []}
        sort={sort}
        onSort={handleSort}
        isLoading={isLoading}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPage(1)
          setPageSize(size)
        }}
      />
    </div>
  )
}
