import { Module } from '@nestjs/common'
import { NativeModule } from '../native/native.module'
import { Sqlite3Module } from '../sqlite3/sqlite3.module'
import { BackupService } from './services/backup.service'

@Module({
  providers: [BackupService],
  exports: [BackupService],
  imports: [Sqlite3Module, NativeModule],
})
export class BackupModule {}
