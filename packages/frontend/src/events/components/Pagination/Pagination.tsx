import { PageButton } from './PageButton'

interface Props {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function Pagination({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange }: Props) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="text-slate-600">
        {start}–{end} of {total}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-600">
          Rows per page:{' '}
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="ml-1 rounded border border-slate-300 bg-white px-2 py-1"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <PageButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Prev
        </PageButton>
        <span className="px-2 text-slate-700">
          Page {page} / {totalPages}
        </span>
        <PageButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next ›
        </PageButton>
      </div>
    </div>
  )
}

