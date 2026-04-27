export interface PostgrestQueryParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
  category?: string
  search?: string
}

export function buildEventsParams(params: PostgrestQueryParams): Record<string, string> {
  const out: Record<string, string> = { select: '*' }

  out.order = params.sortBy
    ? `${params.sortBy}.${params.sortOrder ?? 'asc'}`
    : 'startDate.desc'

  if (params.status) out.status = `eq.${params.status}`
  if (params.category) out.category = `eq.${params.category}`
  if (params.search) {
    const s = params.search.replace(/[(),]/g, '')
    out.or = `(title.ilike.*${s}*,location.ilike.*${s}*)`
  }

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  out.limit = String(pageSize)
  out.offset = String((page - 1) * pageSize)

  return out
}

export function parseContentRangeTotal(header: string | null | undefined): number {
  if (!header) return 0
  const slash = header.indexOf('/')
  if (slash === -1) return 0
  const total = header.slice(slash + 1)
  return total === '*' ? 0 : Number(total)
}
