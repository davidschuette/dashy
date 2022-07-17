import { Backup, BackupDto } from '@dashy/api-interfaces'
import { Injectable } from '@nestjs/common'
import { FileService } from './file.service'

@Injectable()
export class BackupService {
  private backups: Backup[] = []

  constructor(private readonly fileService: FileService) {
    this.backups = this.fileService.loadFromDrive()
  }

  createBackup({ date, downtime, compressedSize, compression, duration, img, rawSize, toolName }: BackupDto) {
    const obj = new Backup(new Date(date), duration, toolName, compression, downtime, rawSize, compressedSize, img)
    this.backups.unshift(obj)
    this.fileService.flushToDrive(this.backups)
  }

  getBackups(length: number, skip = 0): BackupDto[] {
    return this.backups.slice(skip, skip + length).map(({ date, ...rest }) => ({ date: date.getTime(), ...rest }))
  }

  getLastBackupTime(toolName: string): number | undefined {
    return this.backups.find((_) => _.toolName === toolName)?.date.getTime()
  }
}
