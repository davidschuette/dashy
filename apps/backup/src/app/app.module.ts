import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'

import { LogModule } from '@dashy/util/logger'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { NativeModule } from './native/native.module'

@Global()
@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), LogModule, NativeModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [LogModule],
})
export class AppModule {}
