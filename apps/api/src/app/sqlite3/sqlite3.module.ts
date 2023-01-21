import { Module } from '@nestjs/common'
import { Sqlite3Service } from './services/sqlite3.service'

@Module({
  providers: [Sqlite3Service],
  exports: [Sqlite3Service],
})
export class Sqlite3Module {}
