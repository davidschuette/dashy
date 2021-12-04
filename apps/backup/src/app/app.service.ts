import { BackupDto } from '@dashy/api-interfaces'
import { HttpService } from '@nestjs/axios'
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { exec } from 'child_process'
import { CronJob } from 'cron'
import { firstValueFrom } from 'rxjs'
import { environment } from '../environments/environment'
import { ToolBackup } from './models/tool-backup'
import { LogService } from '@dashy/util/logger'

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly http: HttpService, private readonly schedulerRegistry: SchedulerRegistry, private readonly logger: LogService) {}

  onModuleInit() {
    if (environment.production) {
      this.initialiseBackupCronJobs()
    } else {
      this.logger.debug('Skipping cron initialisation due to development mode.')
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
      const command = exec(`rsync --delete -az ${environment.sshBase}:${basePath}/${folderName}/ ${environment.storage}${folderName}/`)

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
      const command = exec(`du -hs ${environment.storage}${tool.folderName} | awk '{ print $1 }'`)
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
      const command = exec(`ls -lh ${environment.storage}${tool.archiveName} | awk '{ print $5 }'`)
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
      this.logger.log(`No commands ${tool.folderName}`)
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
    return new Promise((resolve, reject) => {
      const command = exec(`tar -cz ${environment.storage}${tool.folderName} -f ${environment.storage}${tool.archiveName}`)

      command.stderr.on('data', (err) => {
        this.logger.error(err)
      })

      command.on('exit', () => {
        resolve()
      })
    })
  }

  setMaintenanceStatus(toolName: string) {
    return firstValueFrom(this.http.post<void>(environment.apiPath + `tools/${toolName}/maintenance`))
  }

  clearMaintenanceStatus(toolName: string) {
    return firstValueFrom(this.http.delete<void>(environment.apiPath + `tools/${toolName}/maintenance`))
  }

  notifyServer(data: BackupDto) {
    return firstValueFrom(this.http.post<void>(environment.apiPath + 'backups/', data))
  }
}
