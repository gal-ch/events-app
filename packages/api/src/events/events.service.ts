import { Injectable } from '@nestjs/common'
import { PrismaService } from '../shared/modules/prisma/prisma.service'
import type { PaginatedResponse, Event } from '@events/types'

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

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

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
