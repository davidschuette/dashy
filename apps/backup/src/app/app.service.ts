import { BackupDto } from '@dashy/api-interfaces'
import { LogService } from '@dashy/util/logger'
import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { exec } from 'child_process'
import { CronJob } from 'cron'
import { readdir, rm } from 'fs/promises'
import { join } from 'path'
import { firstValueFrom } from 'rxjs'
import { URL } from 'url'
import { environment } from '../environments/environment'
import { ToolBackup } from './models/tool-backup'

@Injectable()
export class AppService implements OnModuleInit {
  private readonly FILE_NAME_PATTERN =
    /^([a-zA-Z0-9]+)_([0-9]{4}-(01|02|03|04|05|06|07|08|09|10|11|12)-(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)T(0[0-9]|1[0-9]|20|21|22|23):([0-5][0-9]):([0-5][0-9]).[0-9]{3})Z\.tar\.gz$/

  constructor(private readonly http: HttpService, private readonly schedulerRegistry: SchedulerRegistry, private readonly logger: LogService) {
    if (!environment.backups.every((_) => _.archiveName.match(/^[a-zA-Z0-9]+$/))) {
      throw new Error(
        `ArchiveNames '${environment.backups
          .map((_) => _.archiveName)
          .filter((_) => !_.match(/^[a-zA-Z0-9]+$/))
          .join(', ')}' does not meet regex /^[a-zA-Z0-9]+$/`
      )
    }
  }

  onModuleInit() {
    if (environment.production) {
      if (environment.backups.length === 0) {
        this.logger.warn(`No backup jobs set up.`)
      }

      this.initialiseBackupCronJobs()
    } else {
      this.logger.debug('Skipping cron initialisation due to development mode.')
    }
  }

  async getBackupFiles({ archiveName }: ToolBackup): Promise<{ name: string; date: Date }[]> {
    const files = await readdir(environment.storage)

    return files
      .filter((_) => _.startsWith(archiveName + '_') && this.FILE_NAME_PATTERN.test(_))
      .map((_) => ({ name: _, date: new Date(_.match(this.FILE_NAME_PATTERN)[2]) }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  async deleteBackupFiles(tool: ToolBackup) {
    const files = await this.getBackupFiles(tool)

    if (files.length > tool.maxNumberOfVersions) {
      const toDelete = files.slice(tool.maxNumberOfVersions)
      await Promise.all(toDelete.map((_) => rm(join(environment.storage, _.name))))

      this.logger.log(
        `Removed ${files.length - tool.maxNumberOfVersions} overhanging version${files.length - tool.maxNumberOfVersions === 1 ? '' : 's'} of tool '${
          tool.toolName
        }'`,
        `BackupJob.${tool.toolName}`
      )
    } else {
      this.logger.debug(`No files to delete for tool '${tool.toolName}'`, `BackupJob.${tool.toolName}`)
    }
  }

  async initialiseBackupCronJobs() {
    const backups = environment.backups

    for (const backup of backups) {
      const job = new CronJob(backup.cron, () => {
        this.logger.verbose(`Job for tool ${backup.toolName} is running`)
        this.backupTool(backup)
      })

      this.schedulerRegistry.addCronJob(backup.toolName, job)
      job.start()

      this.logger.verbose(`Job for tool ${backup.toolName} has been scheduled with cron '${backup.cron}'`)
    }
  }

  syncFolder(folderName: string, basePath: string): Promise<void> {
    return new Promise((resolve) => {
      const folderPath = join(environment.storage, folderName, '/')

      const command = exec(`rsync --delete -az ${environment.sshBase}:${join(basePath, folderName, '/')} ${folderPath}`)

      command.stderr.on('data', (err) => {
        this.logger.error(err, 'AppService.syncFolder')
      })

      command.on('exit', () => {
        resolve()
      })
    })
  }

  executeRemoteCommand(name: string): Promise<void> {
    return new Promise((resolve) => {
      const command = exec(`ssh ${environment.sshBase} '${name}'`)

      command.stderr.on('data', (err) => {
        this.logger.error(err)
      })

      command.on('exit', () => {
        resolve()
      })
    })
  }

  async getRawSizeOfBackup(fileName: string): Promise<string> {
    return new Promise((resolve) => {
      const command = exec(`du -hs ${join(environment.storage, fileName)} | awk '{ print $1 }'`)
      let result = ''

      command.stderr.on('data', (err) => {
        this.logger.error(err)
      })

      command.stdout.on('data', (chunk) => (result += chunk))

      command.on('exit', () => {
        resolve(result.replace('\n', ''))
      })
    })
  }

  async getCompressedSizeOfBackup(fileName: string): Promise<string> {
    return new Promise((resolve) => {
      const command = exec(`ls -lh ${join(environment.storage, fileName)} | awk '{ print $5 }'`)
      let result = ''

      command.stderr.on('data', (err) => {
        this.logger.error(err)
      })

      command.stdout.on('data', (chunk) => (result += chunk))

      command.on('exit', () => {
        resolve(result.replace('\n', ''))
      })
    })
  }

  triggerBackup(toolName: string) {
    const tool = environment.backups.find((_) => _.toolName === toolName)

    if (!tool) {
      throw new NotFoundException('ToolNotFound')
    }

    this.backupTool(tool)
  }

  async backupTool(tool: ToolBackup) {
    const time = Date.now()

    this.logger.log(`Starting backup ${tool.folderName}`, `BackupJob.${tool.toolName}`)

    if (tool.commands) {
      await this.setMaintenanceStatus(tool.toolName)
      await this.executeRemoteCommand(tool.commands.stop)

      this.logger.log(`Stopped ${tool.folderName}`, `BackupJob.${tool.toolName}`)
    } else {
      this.logger.debug(`No commands ${tool.folderName}`, `BackupJob.${tool.toolName}`)
    }

    await this.syncFolder(tool.folderName, tool.basePath)
    this.logger.log(`Synced folder ${tool.folderName}`, `BackupJob.${tool.toolName}`)

    if (tool.commands) {
      await this.executeRemoteCommand(tool.commands.start)
      this.logger.log(`Restarted ${tool.folderName}`, `BackupJob.${tool.toolName}`)
      await this.clearMaintenanceStatus(tool.toolName)
    }

    const downtime = Date.now() - time

    const fileName = await this.createArchive(tool)
    const diff = Date.now() - time

    this.logger.log(`Archived ${tool.folderName} in ${diff}ms`, `BackupJob.${tool.toolName}`)

    const [rawSize, compressedSize] = await Promise.all([this.getRawSizeOfBackup(fileName), this.getCompressedSizeOfBackup(fileName)])

    await this.deleteBackupFiles(tool)

    await this.notifyServer({
      date: Date.now(),
      toolName: tool.toolName,
      img: tool.img,
      downtime,
      duration: diff,
      compression: diff - downtime,
      rawSize,
      compressedSize,
    })
  }

  /*
   * @returns file name
   */
  createArchive(tool: ToolBackup): Promise<string> {
    return new Promise((resolve) => {
      const fileName = `${tool.archiveName}_${new Date().toJSON()}.tar.gz`
      const command = exec(`tar -c --use-compress-program=pigz ${join(environment.storage, tool.folderName)} -f ${join(environment.storage, fileName)}`)

      command.stderr.on('data', (err) => {
        this.logger.error(err)
      })

      command.on('exit', () => {
        resolve(fileName)
      })
    })
  }

  setMaintenanceStatus(toolName: string) {
    return firstValueFrom(
      this.http.post<void>(new URL(`tools/${toolName}/maintenance`, environment.apiPath).href, undefined, {
        headers: { authorization: environment.apiAuthenticationKey },
      })
    )
  }

  clearMaintenanceStatus(toolName: string) {
    return firstValueFrom(
      this.http.delete<void>(new URL(`tools/${toolName}/maintenance`, environment.apiPath).href, {
        headers: { authorization: environment.apiAuthenticationKey },
      })
    )
  }

  notifyServer(data: BackupDto) {
    return firstValueFrom(
      this.http.post<void>(new URL('backups', environment.apiPath).href, data, {
        headers: { authorization: environment.apiAuthenticationKey },
      })
    )
  }
}
