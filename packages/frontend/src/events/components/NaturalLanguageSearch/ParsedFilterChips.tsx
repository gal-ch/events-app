import type { NlSearchParsedFilter } from '@/shared/types'

interface Props {
  parsedFilter: NlSearchParsedFilter
  lastQuery: string
  onClear: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toISOString().slice(0, 10)
}

function chipsFor(parsed: NlSearchParsedFilter): string[] {
  const chips: string[] = []
  if (parsed.statuses?.length) {
    chips.push(`status ∈ {${parsed.statuses.join(', ')}}`)
  }
  if (parsed.categories?.length) {
    chips.push(`category ∈ {${parsed.categories.join(', ')}}`)
  }
  if (parsed.notStatuses?.length) {
    chips.push(`status ∉ {${parsed.notStatuses.join(', ')}}`)
  }
  if (parsed.notCategories?.length) {
    chips.push(`category ∉ {${parsed.notCategories.join(', ')}}`)
  }
  if (parsed.search) chips.push(`text ~ "${parsed.search}"`)
  if (parsed.startDateGte) chips.push(`from ${formatDate(parsed.startDateGte)}`)
  if (parsed.startDateLte) chips.push(`to ${formatDate(parsed.startDateLte)}`)
  if (parsed.capacityGt !== undefined) chips.push(`capacity > ${parsed.capacityGt}`)
  if (parsed.capacityLt !== undefined) chips.push(`capacity < ${parsed.capacityLt}`)
  if (parsed.sortBy) chips.push(`sort = ${parsed.sortBy} ${parsed.sortOrder ?? 'asc'}`)
  return chips
}

export function ParsedFilterChips({ parsedFilter, lastQuery, onClear }: Props) {
  const chips = chipsFor(parsedFilter)
  const combinator = parsedFilter.combinator ?? 'AND'
  const matchLabel =
    chips.length > 1 ? (combinator === 'OR' ? 'matching any of:' : 'matching all of:') : 'as:'

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">
        Interpreted &ldquo;{lastQuery}&rdquo; {matchLabel}
      </span>
      {chips.length === 0 ? (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
          no filters extracted
        </span>
      ) : (
        chips.map((c, i) => (
          <span key={c} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-xs font-semibold text-slate-400">{combinator}</span>
            )}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {c}
            </span>
          </span>
        ))
      )}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-xs text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
      >
        clear
      </button>
    </div>
  )
}
