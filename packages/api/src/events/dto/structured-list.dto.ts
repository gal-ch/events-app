import { Type } from 'class-transformer'
import { IsIn, IsInt, IsObject, IsOptional, Max, Min } from 'class-validator'
import type { NlSearchParsedFilter } from '@events/types'

const SORTABLE_FIELDS = ['startDate', 'endDate', 'capacity', 'title', 'createdAt'] as const

export class StructuredListDto {
  @IsObject()
  filter!: NlSearchParsedFilter

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number

  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sortBy?: (typeof SORTABLE_FIELDS)[number]

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'
}
