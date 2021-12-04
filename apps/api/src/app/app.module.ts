import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'
import { LogModule } from '@dashy/util/logger'

@Module({
  imports: [HttpModule, LogModule],
  controllers: [AppController],
  providers: [AppService, BackupService],
})
export class AppModule {}
