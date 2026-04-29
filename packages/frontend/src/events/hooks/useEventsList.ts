import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchEvents, type FetchEventsParams } from '../services/api'

interface Options {
  enabled?: boolean
}

export function useEventsList(params: FetchEventsParams, options: Options = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ['events', 'postgrest', params],
    queryFn: () => fetchEvents(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}
