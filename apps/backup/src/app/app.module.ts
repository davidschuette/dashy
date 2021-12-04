import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ScheduleModule } from '@nestjs/schedule'
import { LogModule } from '@dashy/util/logger'

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), LogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
