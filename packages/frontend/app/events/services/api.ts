import type { Event, PaginatedResponse } from '@events/types'
import type { PostgrestQueryParams } from '@/shared/utils/postgrest'
import { getResponse } from '@/shared/utils/http'
import { buildEventsParams, parseContentRangeTotal } from '@/shared/utils/postgrest'

export type FetchEventsParams = PostgrestQueryParams

export async function fetchEvents(params: FetchEventsParams = {}): Promise<PaginatedResponse> {
  const res = await getResponse<Event[]>('/Event', buildEventsParams(params), {
    headers: { Prefer: 'count=exact' },
  })

  const total = parseContentRangeTotal(res.headers['content-range'])
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10

  return {
    data: res.data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
