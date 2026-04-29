import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/modules/prisma/prisma.service'
import type { PaginatedResponse, Event } from '@events/types'
import { buildEventsWhere } from './events.where'

interface ListParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
  category?: string
  search?: string
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: ListParams): Promise<PaginatedResponse> {
    const { page, pageSize, sortBy, sortOrder, status, category, search } = params

    const where = buildEventsWhere({
      statuses: status ? [status] : undefined,
      categories: category ? [category] : undefined,
      search,
    })

    const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'asc' } : { startDate: 'desc' as const }

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
}
