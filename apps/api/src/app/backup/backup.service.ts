import { Backup, BackupDto } from '@dashy/api-interfaces'
import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { readFileSync, writeFileSync } from 'fs'
import { environment } from '../../environments/environment'

@Injectable()
export class BackupService {
  private backups: Backup[] = []

  constructor(private readonly http: HttpService) {
    this.loadFromDrive()
  }

  private loadFromDrive() {
    this.backups = (JSON.parse(readFileSync(environment.storage.backups).toString()) as BackupDto[]).map(({ date, ...rest }) => ({
      date: new Date(date),
      ...rest,
    }))
  }

  private flushToDrive() {
    writeFileSync(environment.storage.backups, JSON.stringify(this.backups))
  }

  createBackup({ date, downtime, compressedSize, compression, duration, img, rawSize, toolName }: BackupDto) {
    const obj = new Backup(new Date(date), duration, toolName, compression, downtime, rawSize, compressedSize, img)
    this.backups.unshift(obj)
    this.flushToDrive()
  }

  getBackups(): BackupDto[] {
    return this.backups.map(({ date, ...rest }) => ({ date: date.getTime(), ...rest }))
  }

  getLastBackupTime(toolName: string): number | undefined {
    return this.backups.find((_) => _.toolName === toolName)?.date.getTime()
  }
}
