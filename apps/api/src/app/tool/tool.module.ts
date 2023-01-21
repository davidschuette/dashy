import { Module } from '@nestjs/common'
import { BackupModule } from '../backup/backup.module'
import { Sqlite3Module } from '../sqlite3/sqlite3.module'
import { ToolService } from './services/tool.service'

@Module({
  providers: [ToolService],
  imports: [Sqlite3Module, BackupModule],
  exports: [ToolService],
})
export class ToolModule {}
