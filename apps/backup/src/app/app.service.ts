import { BackupDto } from '@dashy/api-interfaces'
import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { exec } from 'child_process'
import { CronJob } from 'cron'
import { join } from 'path'
import { firstValueFrom } from 'rxjs'
import { environment } from '../environments/environment'
import { ToolBackup } from './models/tool-backup'
import { LogService } from '@dashy/util/logger'
import { readdir, rm } from 'fs/promises'
import { URL } from 'url'

@Injectable()
export class AppService implements OnModuleInit {
  private readonly FILE_NAME_PATTERN =
    /^([a-zA-Z]+)_([0-9]{4}-(01|02|03|04|05|06|07|08|09|10|11|12)-(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)T(0[0-9]|1[0-9]|20|21|22|23):([0-5][0-9]):([0-5][0-9]).[0-9]{3})Z\.tar\.gz$/

  constructor(private readonly http: HttpService, private readonly schedulerRegistry: SchedulerRegistry, private readonly logger: LogService) {}

  onModuleInit() {
    if (environment.production) {
      this.initialiseBackupCronJobs()
    } else {
      this.logger.debug('Skipping cron initialisation due to development mode.')
    }
  }

  async getBackupFiles({ archiveName }: ToolBackup): Promise<{ name: string; date: Date }[]> {
    const files = await readdir(environment.storage)

    return files
      .filter((_) => _.startsWith(archiveName + '_') && this.FILE_NAME_PATTERN.test(_))
      .map((_) => {
        return { name: _, date: new Date(_.match(this.FILE_NAME_PATTERN)[2]) }
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  getAmountOfBackups(tool: ToolBackup): Promise<number> {
    return this.getBackupFiles(tool).then((_) => _.length)
  }

  async deleteBackupFiles(tool: ToolBackup) {
    const files = await this.getBackupFiles(tool)

    if (files.length > tool.maxNumberOfVersions) {
      const toDelete = files.slice(tool.maxNumberOfVersions)
      await Promise.all(toDelete.map((_) => rm(join(environment.storage, _.name))))

      this.logger.log(
        `Removed ${files.length - tool.maxNumberOfVersions} overhanging version${files.length - tool.maxNumberOfVersions === 1 ? '' : 's'} of tool '${
          tool.toolName
        }'`
      )
    } else {
      this.logger.debug(`No files to delete for tool '${tool.toolName}'`)
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
      const command = exec(`rsync --delete -az ${environment.sshBase}:${join(basePath, folderName, '/')} ${join(environment.storage, folderName, '/')}`)

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

  async getRawSizeOfBackup(tool: ToolBackup): Promise<string> {
    return new Promise((resolve) => {
      const command = exec(`du -hs ${join(environment.storage, tool.folderName)} | awk '{ print $1 }'`)
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

  async getCompressedSizeOfBackup(tool: ToolBackup): Promise<string> {
    return new Promise((resolve) => {
      const command = exec(`ls -lh ${join(environment.storage, tool.archiveName)} | awk '{ print $5 }'`)
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

    this.logger.log(`Starting backup ${tool.folderName}`)

    if (tool.commands) {
      await this.setMaintenanceStatus(tool.toolName)
      await this.executeRemoteCommand(tool.commands.stop)

      this.logger.log(`Stopped ${tool.folderName}`)
    } else {
      this.logger.debug(`No commands ${tool.folderName}`)
    }

    await this.syncFolder(tool.folderName, tool.basePath)
    this.logger.log(`Synced folder ${tool.folderName}`)

    if (tool.commands) {
      await this.executeRemoteCommand(tool.commands.start)
      this.logger.log(`Restarted ${tool.folderName}`)
      await this.clearMaintenanceStatus(tool.toolName)
    }

    const downtime = Date.now() - time

    await this.createArchive(tool)
    const diff = Date.now() - time

    this.logger.log(`Archived ${tool.folderName} in ${diff}ms`)

    const [rawSize, compressedSize] = await Promise.all([this.getRawSizeOfBackup(tool), this.getCompressedSizeOfBackup(tool)])

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

  createArchive(tool: ToolBackup): Promise<void> {
    return new Promise((resolve) => {
      const command = exec(
        `tar -c --use-compress-program=pigz ${join(environment.storage, tool.folderName)} -f ${join(
          environment.storage,
          tool.archiveName
        )}_${new Date().toJSON()}.tar.gz`
      )

      command.stderr.on('data', (err) => {
        this.logger.error(err)
      })

      command.on('exit', () => {
        resolve()
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
