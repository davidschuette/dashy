import { LogModule } from '@dashy/util/logger'
import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BackupModule } from './backup/backup.module'
import { NativeModule } from './native/native.module'
import { Sqlite3Module } from './sqlite3/sqlite3.module'
import { ToolModule } from './tool/tool.module'
import { WebsocketController } from './websocket.controller'

@Global()
@Module({
  imports: [HttpModule, LogModule, Sqlite3Module, ToolModule, NativeModule, BackupModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, WebsocketController],
  exports: [LogModule, WebsocketController],
})
export class AppModule {}
