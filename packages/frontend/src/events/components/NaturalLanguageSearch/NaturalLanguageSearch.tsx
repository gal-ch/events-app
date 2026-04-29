import { useState, type FormEvent } from 'react'
import type { NlSearchParsedFilter } from '@/shared/types'
import { cn } from '@/shared/utils/cn'
import { ParsedFilterChips } from './ParsedFilterChips'

interface Props {
  onSubmit: (query: string) => void
  onClear: () => void
  isPending: boolean
  error: string | null
  parsedFilter: NlSearchParsedFilter | null
  lastQuery: string | null
}

export function NaturalLanguageSearch({
  onSubmit,
  onClear,
  isPending,
  error,
  parsedFilter,
  lastQuery,
}: Props) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || isPending) return
    onSubmit(trimmed)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="nl-search" className="text-sm font-medium text-slate-700 sm:w-auto">
          Ask in plain English
        </label>
        <input
          id="nl-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. cancelled music events next month"
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className={cn(
            'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition',
            'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:bg-blue-400',
          )}
        >
          {isPending ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {parsedFilter && lastQuery && (
        <ParsedFilterChips parsedFilter={parsedFilter} lastQuery={lastQuery} onClear={onClear} />
      )}
    </div>
  )
}
