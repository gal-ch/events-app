import type { NlSearchParsedFilter } from '@events/types'

export interface EventsWhereInput {
  statuses?: string[]
  categories?: string[]
  notStatuses?: string[]
  notCategories?: string[]
  search?: string
  startDateGte?: string
  startDateLte?: string
  capacityGt?: number
  capacityLt?: number
}

export type WhereCombinator = 'AND' | 'OR'

function nonEmpty<T>(arr: T[] | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0
}

function categoryInsensitive(values: string[]) {
  // Prisma's `in` is case-sensitive on String columns. We OR a list of
  // case-insensitive equals so "music" matches "Music" in the DB.
  return values.map((v) => ({ category: { equals: v, mode: 'insensitive' as const } }))
}

export function buildEventsWhere(
  filter: EventsWhereInput,
  combinator: WhereCombinator = 'AND',
): Record<string, unknown> {
  const leaves: Array<Record<string, unknown>> = []

  if (nonEmpty(filter.statuses)) leaves.push({ status: { in: filter.statuses } })
  if (nonEmpty(filter.notStatuses)) leaves.push({ status: { notIn: filter.notStatuses } })

  if (nonEmpty(filter.categories)) {
    const orList = categoryInsensitive(filter.categories)
    leaves.push(orList.length === 1 ? orList[0] : { OR: orList })
  }
  if (nonEmpty(filter.notCategories)) {
    leaves.push({
      AND: filter.notCategories.map((v) => ({
        NOT: { category: { equals: v, mode: 'insensitive' as const } },
      })),
    })
  }

  if (filter.search) {
    leaves.push({
      OR: [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { location: { contains: filter.search, mode: 'insensitive' } },
      ],
    })
  }
  if (filter.startDateGte || filter.startDateLte) {
    const startDate: Record<string, Date> = {}
    if (filter.startDateGte) startDate.gte = new Date(filter.startDateGte)
    if (filter.startDateLte) startDate.lte = new Date(filter.startDateLte)
    leaves.push({ startDate })
  }
  if (filter.capacityGt !== undefined || filter.capacityLt !== undefined) {
    const capacity: Record<string, number> = {}
    if (filter.capacityGt !== undefined) capacity.gt = filter.capacityGt
    if (filter.capacityLt !== undefined) capacity.lt = filter.capacityLt
    leaves.push({ capacity })
  }

  if (leaves.length === 0) return {}
  if (leaves.length === 1) return leaves[0]
  return combinator === 'OR' ? { OR: leaves } : { AND: leaves }
}

export function parsedFilterToWhereInput(parsed: NlSearchParsedFilter): EventsWhereInput {
  return {
    statuses: parsed.statuses,
    categories: parsed.categories,
    notStatuses: parsed.notStatuses,
    notCategories: parsed.notCategories,
    search: parsed.search,
    startDateGte: parsed.startDateGte,
    startDateLte: parsed.startDateLte,
    capacityGt: parsed.capacityGt,
    capacityLt: parsed.capacityLt,
  }
}
