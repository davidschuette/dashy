import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, BackupService],
})
export class AppModule {}
