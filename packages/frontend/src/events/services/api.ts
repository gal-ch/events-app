import type {
  Event,
  NlSearchParsedFilter,
  NlSearchRequest,
  NlSearchResponse,
  PaginatedResponse,
  StructuredListRequest,
} from '@/shared/types'
import type { PostgrestQueryParams } from '@/shared/utils/postgrest'
import { getResponse, nestPost } from '@/shared/utils/http'
import { buildEventsParams, parseContentRangeTotal } from '@/shared/utils/postgrest'

export type FetchEventsParams = PostgrestQueryParams

export interface FetchEventsResult {
  data: Event[]
  total: number
}

export async function fetchEvents(params: FetchEventsParams = {}): Promise<FetchEventsResult> {
  const res = await getResponse<Event[]>('/Event', buildEventsParams(params), {
    headers: { Prefer: 'count=exact' },
  })

  return {
    data: res.data,
    total: parseContentRangeTotal(res.headers['content-range']),
  }
}

export async function searchByNaturalLanguage(req: NlSearchRequest): Promise<NlSearchResponse> {
  return nestPost<NlSearchResponse>('/events/nl-search', { ...req })
}

export async function fetchEventsByFilter(
  filter: NlSearchParsedFilter,
  opts: Omit<StructuredListRequest, 'filter'> = {},
): Promise<PaginatedResponse> {
  return nestPost<PaginatedResponse>('/events/list', { filter, ...opts })
}
