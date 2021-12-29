import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'
import { LogModule } from '@dashy/util/logger'
import { ToolFileService } from './tool/tool-file.service'
import { FileService } from './backup/file.service'

@Module({
  imports: [HttpModule, LogModule],
  controllers: [AppController],
  providers: [AppService, BackupService, ToolFileService, FileService],
})
export class AppModule {}
