export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface EventEntity {
  id: number
  title: string
  category: string
  location: string
  status: EventStatus
  startDate: Date
  endDate: Date
  capacity: number
  createdAt: Date
}

export interface Event {
  id: number
  title: string
  category: string
  location: string
  status: EventStatus
  startDate: string
  endDate: string
  capacity: number
  createdAt: string
}

export interface PaginatedResponse {
  data: Event[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SortState {
  sortBy: keyof Event
  sortOrder: 'asc' | 'desc'
}

export interface FilterState {
  search: string
  category: string
  status: string
}
