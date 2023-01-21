import { CreateBackupDto } from '@dashy/api-interfaces'
import { LogService } from '@dashy/util/logger'
import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { join } from 'path'
import { firstValueFrom } from 'rxjs'
import { URL } from 'url'
import { environment } from '../environments/environment'
import { ToolBackup } from './models/tool-backup'
import { NativeService } from './native/services/native.service'

@Injectable()
export class AppService implements OnModuleInit {
  private readonly FILE_NAME_PATTERN =
    /^([a-zA-Z0-9]+)_([0-9]{4}-(01|02|03|04|05|06|07|08|09|10|11|12)-(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)T(0[0-9]|1[0-9]|20|21|22|23):([0-5][0-9]):([0-5][0-9]).[0-9]{3})Z\.tar\.gz$/

  constructor(
    private readonly http: HttpService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly logger: LogService,
    private readonly nativeService: NativeService
  ) {
    if (!environment.backups.every((_) => _.archiveName.match(/^[a-zA-Z0-9]+$/))) {
      throw new Error(
        `ArchiveNames '${environment.backups
          .map((_) => _.archiveName)
          .filter((_) => !_.match(/^[a-zA-Z0-9]+$/))
          .join(', ')}' does not meet regex /^[a-zA-Z0-9]+$/`
      )
    }
  }

  async onModuleInit() {
    if (environment.production) {
      if (environment.backups.length === 0) {
        this.logger.warn(`No backup jobs set up.`)
      }

      await this.initialiseBackupCronJobs()
    } else {
      this.logger.debug('Skipping cron initialisation due to development mode.')
    }
  }

  async getBackupFiles({ archiveName }: ToolBackup): Promise<{ name: string; date: Date }[]> {
    const files = await this.nativeService.readdir(environment.storage)

    return files
      .filter((_) => _.startsWith(archiveName + '_') && this.FILE_NAME_PATTERN.test(_))
      .map((_) => ({ name: _, date: new Date(_.match(this.FILE_NAME_PATTERN)[2]) }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  async deleteBackupFiles(tool: ToolBackup) {
    const files = await this.getBackupFiles(tool)

    if (files.length > tool.maxNumberOfVersions) {
      const toDelete = files.slice(tool.maxNumberOfVersions)
      await Promise.all(toDelete.map((_) => this.nativeService.rm(join(environment.storage, _.name))))

      return files.length - tool.maxNumberOfVersions
    }

    return 0
  }

  async initialiseBackupCronJobs() {
    const backups = environment.backups

    for (const backup of backups) {
      const job = new CronJob(backup.cron, () => {
        this.logger.verbose(`Job for tool ${backup.toolId} is running`)
        this.backupTool(backup)
      })

      this.schedulerRegistry.addCronJob(backup.toolId, job)
      job.start()

      this.logger.verbose(`Job for tool ${backup.toolId} has been scheduled with cron '${backup.cron}'`)
    }
  }

  async syncFolder(folderName: string, basePath: string): Promise<void> {
    const folderPath = join(environment.storage, folderName, '/')

    await this.nativeService.executeCommand(`rsync --delete -az ${environment.sshBase}:${join(basePath, folderName, '/')} ${folderPath}`)
  }

  async executeRemoteCommand(name: string): Promise<void> {
    await this.nativeService.executeCommand(`ssh ${environment.sshBase} '${name}'`)
  }

  async getRawSizeOfBackup(fileName: string): Promise<string> {
    const result = await this.nativeService.executeCommand(`du -hs ${join(environment.storage, fileName)} | awk '{ print $1 }'`)

    return result.replace('\n', '')
  }

  async getCompressedSizeOfBackup(fileName: string): Promise<string> {
    const result = await this.nativeService.executeCommand(`ls -lh ${join(environment.storage, fileName)} | awk '{ print $5 }'`)

    return result.replace('\n', '')
  }

  triggerBackup(toolId: string) {
    const tool = environment.backups.find((_) => _.toolId === toolId)

    if (!tool) {
      throw new NotFoundException('ToolNotFound')
    }

    this.backupTool(tool)
  }

  async backupTool(tool: ToolBackup) {
    const time = Date.now()

    this.logger.log(`Starting backup ${tool.folderName}`, `BackupJob.${tool.toolId}`)

    if (tool.commands) {
      await this.setMaintenanceStatus(tool.toolId)
      await this.executeRemoteCommand(tool.commands.stop)

      this.logger.log(`Stopped ${tool.folderName}`, `BackupJob.${tool.toolId}`)
    } else {
      this.logger.debug(`No commands for ${tool.folderName}`, `BackupJob.${tool.toolId}`)
    }

    this.logger.log(`Starting sync for folder ${tool.folderName}`, `BackupJob.${tool.toolId}`)
    await this.syncFolder(tool.folderName, tool.basePath)
    this.logger.log(`Successfully synced folder ${tool.folderName}`, `BackupJob.${tool.toolId}`)

    if (tool.commands) {
      await this.executeRemoteCommand(tool.commands.start)
      this.logger.log(`Restarted ${tool.folderName}`, `BackupJob.${tool.toolId}`)
      await this.clearMaintenanceStatus(tool.toolId)
    }

    const downtime = Date.now() - time

    this.logger.log(`Starting archiving for ${tool.folderName}`, `BackupJob.${tool.toolId}`)
    const fileName = await this.createArchive(tool)
    const diff = Date.now() - time

    this.logger.log(`Archived ${tool.folderName} in ${diff}ms`, `BackupJob.${tool.toolId}`)

    const rawSize = await this.getRawSizeOfBackup(fileName)

    const deletedAmount = await this.deleteBackupFiles(tool)

    if (deletedAmount > 0) {
      this.logger.log(`Removed ${deletedAmount} overhanging version${deletedAmount === 1 ? '' : 's'} of tool '${tool.toolId}'`, `BackupJob.${tool.toolId}`)
    } else {
      this.logger.debug(`No files to delete for tool '${tool.toolId}'`, `BackupJob.${tool.toolId}`)
    }

    await this.notifyServer(tool.toolId, {
      downtime: tool.commands ? downtime : 0,
      duration: diff,
      rawSize,
    })

    this.logger.log(`Successfully notified server of backup job`, `BackupJob.${tool.toolId}`)
  }

  /*
   * @returns file name
   */
  async createArchive(tool: ToolBackup): Promise<string> {
    const fileName = `${tool.archiveName}_${new Date().toJSON()}.tar.gz`
    await this.nativeService.executeCommand(
      `tar -zc --use-compress-program=pigz  -f ${join(environment.storage, fileName)} ${join(environment.storage, tool.folderName)}`
    )

    return fileName
  }

  setMaintenanceStatus(toolId: string) {
    return firstValueFrom(
      this.http.post<void>(new URL(`tools/${toolId}/maintenance`, environment.apiPath).href, undefined, {
        headers: { authorization: environment.apiAuthenticationKey },
      })
    )
  }

  clearMaintenanceStatus(toolId: string) {
    return firstValueFrom(
      this.http.delete<void>(new URL(`tools/${toolId}/maintenance`, environment.apiPath).href, {
        headers: { authorization: environment.apiAuthenticationKey },
      })
    )
  }

  notifyServer(toolId: string, data: CreateBackupDto) {
    console.log(new URL('backups', environment.apiPath).href)
    return firstValueFrom(
      this.http.post<void>(new URL(`tools/${toolId}/backup`, environment.apiPath).href, data, {
        headers: { authorization: environment.apiAuthenticationKey },
      })
    )
  }
}
