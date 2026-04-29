import { useMemo, useState } from 'react'
import type { FilterState, NlSearchParsedFilter, SortState } from '@/shared/types'
import { EventsTable } from './components/EventsTable/EventsTable'
import { FilterBar } from './components/FilterBar/FilterBar'
import { NaturalLanguageSearch } from './components/NaturalLanguageSearch/NaturalLanguageSearch'
import { Pagination } from './components/Pagination/Pagination'
import { useEventsByFilter } from './hooks/useEventsByFilter'
import { useEventsList } from './hooks/useEventsList'
import { useNlSearch } from './hooks/useNlSearch'

export function EventsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState<SortState>({ sortBy: 'startDate', sortOrder: 'desc' })
  const [filters, setFilters] = useState<FilterState>({ search: '', status: '', category: '' })
  const [parsedFilter, setParsedFilter] = useState<NlSearchParsedFilter | null>(null)
  const [lastQuery, setLastQuery] = useState<string | null>(null)
  const [nlError, setNlError] = useState<string | null>(null)

  const nlSearch = useNlSearch()
  const isNlActive = parsedFilter !== null

  const postgrestParams = useMemo(
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

  const postgrestQuery = useEventsList(postgrestParams, { enabled: !isNlActive })
  const nestQuery = useEventsByFilter(parsedFilter, {
    page,
    pageSize,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  })

  const active = isNlActive ? nestQuery : postgrestQuery
  const events = active.data?.data ?? []
  const total = active.data?.total ?? 0
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

  const handleNlSubmit = (query: string) => {
    setNlError(null)
    nlSearch.mutate(
      { query, page: 1, pageSize },
      {
        onSuccess: (res) => {
          setPage(1)
          setSort({
            sortBy: res.parsedFilter.sortBy ?? 'startDate',
            sortOrder: res.parsedFilter.sortOrder ?? 'desc',
          })
          setParsedFilter(res.parsedFilter)
          setLastQuery(query)
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            (err as Error).message ??
            'Search failed.'
          setNlError(message)
        },
      },
    )
  }

  const handleNlClear = () => {
    setParsedFilter(null)
    setLastQuery(null)
    setNlError(null)
    setPage(1)
    setSort({ sortBy: 'startDate', sortOrder: 'desc' })
    setFilters({ search: '', status: '', category: '' })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Events</h1>
        <p className="text-sm text-slate-600">
          {isNlActive ? (
            <>Showing AI-filtered results from NestJS at <code>localhost:3011</code>.</>
          ) : (
            <>Reading directly from PostgREST at <code>localhost:3010</code>.</>
          )}
        </p>
      </header>

      <NaturalLanguageSearch
        onSubmit={handleNlSubmit}
        onClear={handleNlClear}
        isPending={nlSearch.isPending}
        error={nlError}
        parsedFilter={parsedFilter}
        lastQuery={lastQuery}
      />

      {!isNlActive && <FilterBar value={filters} onChange={handleFiltersChange} />}

      {active.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {(active.error as Error).message}
        </div>
      )}

      <EventsTable
        events={events}
        sort={sort}
        onSort={handleSort}
        isLoading={active.isLoading}
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
