import type { Event } from '@events/types'
import type { PostgrestQueryParams } from '@/shared/utils/postgrest'
import { getResponse } from '@/shared/utils/http'
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
