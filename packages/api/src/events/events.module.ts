import { Module } from '@nestjs/common'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { NlSearchService } from './nl-search.service'
import { PrismaModule } from '@/shared/modules/prisma/prisma.module'
import { OpenAiModule } from '@/shared/modules/openai/openai.module'

@Module({
  imports: [PrismaModule, OpenAiModule],
  controllers: [EventsController],
  providers: [EventsService, NlSearchService],
})
export class EventsModule {}
