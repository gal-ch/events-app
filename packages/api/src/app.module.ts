import { Module, Controller, Get } from '@nestjs/common'
import { EventsModule } from '@/events/events.module'

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok' }
  }
}

@Module({
  imports: [EventsModule],
  controllers: [HealthController],
})
export class AppModule {}
