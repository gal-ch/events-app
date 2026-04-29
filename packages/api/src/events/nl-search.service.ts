import { Injectable } from '@nestjs/common'
import type {
  Event,
  EventStatus,
  NlSearchParsedFilter,
  NlSearchRequest,
  NlSearchResponse,
  PaginatedResponse,
  StructuredListRequest,
} from '@events/types'
import { PrismaService } from '@/shared/modules/prisma/prisma.service'
import { OpenAiService } from '@/shared/modules/openai/openai.service'
import { buildEventsWhere, parsedFilterToWhereInput } from './events.where'

const SORTABLE_FIELDS = ['startDate', 'endDate', 'capacity', 'title', 'createdAt'] as const
const STATUS_VALUES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const

const FILTER_JSON_SCHEMA = {
  name: 'event_filter',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      statuses: {
        type: ['array', 'null'],
        items: { type: 'string', enum: [...STATUS_VALUES] },
        description: 'Statuses to include (OR-joined within this field).',
      },
      categories: {
        type: ['array', 'null'],
        items: { type: 'string' },
        description: 'Categories to include (OR-joined within this field, case-insensitive).',
      },
      notStatuses: {
        type: ['array', 'null'],
        items: { type: 'string', enum: [...STATUS_VALUES] },
        description: 'Statuses to EXCLUDE. Use for "not cancelled", "except completed", etc.',
      },
      notCategories: {
        type: ['array', 'null'],
        items: { type: 'string' },
        description: 'Categories to EXCLUDE.',
      },
      search: {
        type: ['string', 'null'],
        description: 'Free-text matched against event title and location only.',
      },
      startDateGte: { type: ['string', 'null'] },
      startDateLte: { type: ['string', 'null'] },
      capacityGt: {
        type: ['number', 'null'],
        description: 'Capacity strictly greater than this number.',
      },
      capacityLt: {
        type: ['number', 'null'],
        description: 'Capacity strictly less than this number.',
      },
      sortBy: { type: ['string', 'null'], enum: [...SORTABLE_FIELDS, null] },
      sortOrder: { type: ['string', 'null'], enum: ['asc', 'desc', null] },
      combinator: {
        type: 'string',
        enum: ['AND', 'OR'],
        description: 'How to combine populated top-level fields. OR only when user uses "or" between conditions.',
      },
    },
    required: [
      'statuses',
      'categories',
      'notStatuses',
      'notCategories',
      'search',
      'startDateGte',
      'startDateLte',
      'capacityGt',
      'capacityLt',
      'sortBy',
      'sortOrder',
      'combinator',
    ],
  },
}

@Injectable()
export class NlSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openai: OpenAiService,
  ) {}

  async search(req: NlSearchRequest): Promise<NlSearchResponse> {
    const parsedFilter = await this.parseQuery(req.query)
    const result = await this.runFilter({
      filter: parsedFilter,
      page: req.page,
      pageSize: req.pageSize,
      sortBy: parsedFilter.sortBy,
      sortOrder: parsedFilter.sortOrder,
    })
    return { ...result, parsedFilter }
  }

  async runFilter(req: StructuredListRequest): Promise<PaginatedResponse> {
    const page = req.page ?? 1
    const pageSize = req.pageSize ?? 10

    const where = buildEventsWhere(
      parsedFilterToWhereInput(req.filter),
      req.filter.combinator ?? 'AND',
    )

    const sortBy = req.sortBy ?? req.filter.sortBy ?? 'startDate'
    const sortOrder = req.sortOrder ?? req.filter.sortOrder ?? 'desc'
    const orderBy = { [sortBy]: sortOrder } as Record<string, 'asc' | 'desc'>

    const [total, rows] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    const data: Event[] = rows.map((r) => ({
      ...r,
      status: r.status as Event['status'],
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    }
  }

  private async parseQuery(query: string): Promise<NlSearchParsedFilter> {
    const today = new Date().toISOString().slice(0, 10)
    const system = [
      'You translate natural-language event queries into a JSON filter.',
      `Today is ${today}.`,
      `Allowed status values: ${STATUS_VALUES.join(', ')}.`,
      `Allowed sortBy values: ${SORTABLE_FIELDS.join(', ')}.`,
      'Use null for any field the user did not mention. Do not invent values.',
      '`search` is for free-text against title/location only — never put status, category, or capacity words in it.',
      'POSITIVE phrasings ("cancelled events", "music events", "in UPCOMING") → put values in `statuses` / `categories`. NEGATIVE phrasings ("not cancelled", "except completed", "without music") → put values in `notStatuses` / `notCategories`. Examples: "cancelled events" → statuses=["CANCELLED"]; "events that are not cancelled" → notStatuses=["CANCELLED"]; "tech events" → categories=["tech"].',
      'For "more than X capacity", "over X attendees", set capacityGt; for "fewer than", "under", set capacityLt. Don\'t put numbers in `search`.',
      'For multiple values like "music or tech", use the array fields: categories=["music","tech"]. Same for "upcoming or ongoing": statuses=["UPCOMING","ONGOING"].',
      'For relative dates (today, this week, next month, etc.), compute concrete ISO 8601 datetimes from "today".',
      'combinator="OR" only when the user joins TOP-LEVEL conditions with "or" between distinct fields, e.g. "music events or events in Bolivia". Multi-value within one field (statuses, categories) does not require combinator="OR" — that\'s already implicit.',
    ].join(' ')

    const raw = await this.openai.parseJson<Record<string, unknown>>({
      system,
      user: query,
      schema: FILTER_JSON_SCHEMA,
    })

    return this.normalize(raw)
  }

  private normalize(raw: Record<string, unknown>): NlSearchParsedFilter {
    const out: NlSearchParsedFilter = {}

    const cleanStatusArray = (v: unknown): EventStatus[] | undefined => {
      if (!Array.isArray(v)) return undefined
      const valid = v.filter(
        (x): x is EventStatus =>
          typeof x === 'string' && (STATUS_VALUES as readonly string[]).includes(x),
      )
      return valid.length ? valid : undefined
    }
    const cleanStringArray = (v: unknown): string[] | undefined => {
      if (!Array.isArray(v)) return undefined
      const valid = v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      return valid.length ? valid.map((x) => x.trim()) : undefined
    }

    out.statuses = cleanStatusArray(raw.statuses)
    out.categories = cleanStringArray(raw.categories)
    out.notStatuses = cleanStatusArray(raw.notStatuses)
    out.notCategories = cleanStringArray(raw.notCategories)

    if (typeof raw.search === 'string' && raw.search.trim()) out.search = raw.search.trim()
    if (typeof raw.startDateGte === 'string' && raw.startDateGte.trim()) {
      out.startDateGte = raw.startDateGte
    }
    if (typeof raw.startDateLte === 'string' && raw.startDateLte.trim()) {
      out.startDateLte = raw.startDateLte
    }
    if (typeof raw.capacityGt === 'number' && Number.isFinite(raw.capacityGt)) {
      out.capacityGt = raw.capacityGt
    }
    if (typeof raw.capacityLt === 'number' && Number.isFinite(raw.capacityLt)) {
      out.capacityLt = raw.capacityLt
    }
    if (
      typeof raw.sortBy === 'string' &&
      (SORTABLE_FIELDS as readonly string[]).includes(raw.sortBy)
    ) {
      out.sortBy = raw.sortBy as NlSearchParsedFilter['sortBy']
    }
    if (raw.sortOrder === 'asc' || raw.sortOrder === 'desc') out.sortOrder = raw.sortOrder
    if (raw.combinator === 'OR' || raw.combinator === 'AND') out.combinator = raw.combinator

    return out
  }
}
