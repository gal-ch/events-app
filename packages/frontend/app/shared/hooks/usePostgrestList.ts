import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getResponse, parseContentRangeTotal } from '@/shared/utils'

export interface PostgrestListResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UsePostgrestListArgs {
  resource: string
  params?: Record<string, string>
  page: number
  pageSize: number
  queryKey?: readonly unknown[]
  enabled?: boolean
}

export function usePostgrestList<T>({
  resource,
  params,
  page,
  pageSize,
  queryKey,
  enabled,
}: UsePostgrestListArgs) {
  return useQuery({
    queryKey: queryKey ?? ['postgrest', resource, params],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PostgrestListResult<T>> => {
      const res = await getResponse<T[]>(
        `/${resource}`,
        params,
        {
          headers: {
            Accept: 'application/json',
            Prefer: 'count=exact',
          },
        },
      )

      const total = parseContentRangeTotal((res.headers['content-range'] as string | undefined) ?? null)

      return {
        data: res.data,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      }
    },
  })
}

