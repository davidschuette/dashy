import { Backup, BackupDto } from '@dashy/api-interfaces'
import { Injectable } from '@nestjs/common'
import { readFileSync, writeFileSync } from 'fs'
import { environment } from '../../environments/environment'

@Injectable()
export class FileService {
  loadFromDrive() {
    return (JSON.parse(readFileSync(environment.storage.backups).toString()) as BackupDto[]).map(({ date, ...rest }) => ({
      date: new Date(date),
      ...rest,
    }))
  }

  flushToDrive(data: Backup[]) {
    writeFileSync(environment.storage.backups, JSON.stringify(data))
  }
}
