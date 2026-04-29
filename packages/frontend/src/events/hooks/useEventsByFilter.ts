import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { NlSearchParsedFilter, StructuredListRequest } from '@/shared/types'
import { fetchEventsByFilter } from '../services/api'

type FilterOpts = Omit<StructuredListRequest, 'filter'>

export function useEventsByFilter(filter: NlSearchParsedFilter | null, opts: FilterOpts) {
  return useQuery({
    queryKey: ['events', 'nest', filter, opts],
    queryFn: () => {
      if (!filter) throw new Error('useEventsByFilter called with null filter')
      return fetchEventsByFilter(filter, opts)
    },
    placeholderData: keepPreviousData,
    enabled: filter !== null,
  })
}
