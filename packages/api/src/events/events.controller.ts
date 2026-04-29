import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { EventsService } from './events.service'
import { NlSearchService } from './nl-search.service'
import { NlSearchDto } from './dto/nl-search.dto'
import { StructuredListDto } from './dto/structured-list.dto'

@Controller('events')
export class EventsController {
  constructor(
    private readonly events: EventsService,
    private readonly nlSearch: NlSearchService,
  ) {}

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.events.list({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      sortBy,
      sortOrder,
      status,
      category,
      search,
    })
  }

  @Post('nl-search')
  async naturalLanguageSearch(@Body() body: NlSearchDto) {
    return this.nlSearch.search(body)
  }

  @Post('list')
  async listByFilter(@Body() body: StructuredListDto) {
    return this.nlSearch.runFilter({
      filter: body.filter,
      page: body.page,
      pageSize: body.pageSize,
      sortBy: body.sortBy,
      sortOrder: body.sortOrder,
    })
  }
}
