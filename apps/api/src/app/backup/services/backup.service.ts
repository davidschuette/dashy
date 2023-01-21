import { Backup, BackupDto, CreateBackupDto } from '@dashy/api-interfaces'
import { LogService } from '@dashy/util/logger'
import { ConflictException, Injectable, NotFoundException, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { lastValueFrom, Observable } from 'rxjs'
import { environment } from '../../../environments/environment'
import { ToolBackup } from '../../models/tool-backup'
import { ResticStatus } from '../../native/enums/ResticStatus.enum'
import { ResticResponse } from '../../native/models/restic-response.type'
import { NativeService } from '../../native/services/native.service'
import { Sqlite3Service } from '../../sqlite3/services/sqlite3.service'
import { WebsocketController } from '../../websocket.controller'

@Injectable()
export class BackupService implements OnApplicationBootstrap, OnApplicationShutdown {
  private controller: AbortController | undefined

  constructor(
    private readonly sqlite3Service: Sqlite3Service,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly logger: LogService,
    private readonly nativeService: NativeService,
    private readonly webSocketGateway: WebsocketController
  ) {}

  onApplicationShutdown(): void {
    if (this.controller) this.controller.abort()
  }

  async clearMaintenanceStatus(toolId: string): Promise<void> {
    // (id CHAR(36) PRIMARY KEY, name VARCHAR(255), description VARCHAR(255), url VARCHAR(255), img VARCHAR(255), accountCreation CHECK(accountCreation IN ("SELF","ON_REQUEST","LOCKED","NO_ACCOUNT")), isInMaintenance BOOLEAN);
    // await this.sqlite3Service.run(`INSERT INTO tool VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    //   randomUUID(),
    //   'Plex',
    //   'some desc',
    //   'https://plex.lyop.de',
    //   'plex.png',
    //   AccountCreation.SELF,
    //   false,
    // ])
    // await this.sqlite3Service.run(`INSERT INTO container VALUES (?, ?)`, ['068e36b4-929b-49a2-ae3c-01fd69538b49', 's-docker-container-name-2'])
    await this.sqlite3Service.run(`UPDATE tool SET isInMaintenance = false WHERE id = ?`, [toolId])
    //(id CHAR(36) PRIMARY KEY, tool CHAR(36) REFERENCES tool, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, duration INT, compression INT, downtime INT, rawSize VARCHAR(255), compressedSize VARCHAR(255), img VARCHAR(255));
    // await this.sqlite3Service.run(`INSERT INTO backup (id, tool, duration, compression, downtime, rawSize, compressedSize) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    //   randomUUID(),
    //   '25396289-e7b0-4593-aff9-6612c271e9a3',
    //   10000,
    //   11000,
    //   12000,
    //   '2kB',
    //   '1kB',
    // ])
  }

  async setMaintenanceStatus(toolId: string): Promise<void> {
    await this.sqlite3Service.run(`UPDATE tool SET isInMaintenance = true WHERE id = ?`, [toolId])
  }

  async createBackup(toolId: string, { downtime, duration, rawSize }: CreateBackupDto): Promise<void> {
    await this.sqlite3Service.run(`INSERT INTO backup (id, tool, duration, downtime, rawSize) VALUES (?, ?, ?, ?, ?)`, [
      randomUUID(),
      toolId,
      duration,
      downtime,
      rawSize,
    ])
  }

  getBackups(length: number, skip = 0): Promise<BackupDto[]> {
    return this.sqlite3Service.get<BackupDto>(
      'SELECT backup.*, tool.img AS img, tool.name AS toolName FROM backup JOIN tool ON backup.tool = tool.id ORDER BY backup.date DESC LIMIT ? OFFSET ?',
      [length, skip]
    )
  }

  async getLastBackupTime(toolId: string): Promise<number | undefined> {
    const data = await this.sqlite3Service.getOne<Backup>(`SELECT * FROM backup WHERE tool = ? ORDER BY date DESC LIMIT 1`, [toolId])

    return data ? new Date(data.date).getTime() : undefined
  }

  async onApplicationBootstrap() {
    if (environment.production) {
      if (environment.backups.length === 0) {
        this.logger.warn(`No backup jobs set up.`)
      }

      await this.initialiseBackupCronJobs()
    } else {
      this.logger.debug('Skipping cron initialisation due to development mode.')
    }
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

  syncFolder(folderName: string, basePath: string, controller: AbortController) {
    const folderPath = join('/', basePath, folderName)

    const obs = this.nativeService.executeCommand(`/opt/homebrew/bin/restic backup --json ${folderPath}`, controller.signal, {
      RESTIC_REPOSITORY: environment.restic.repository,
      RESTIC_PASSWORD: environment.restic.password,
    }) as Observable<ResticResponse>

    obs.subscribe({
      next: (_) => this.webSocketGateway.sendProgressUpdate(_),
      error: (_) => this.webSocketGateway.sendProgressUpdate(_),
      complete: () => this.webSocketGateway.sendProgressUpdate({ message_type: ResticStatus.COMPLETE }),
    })
  }

  async triggerBackup(toolId: string) {
    const tool = environment.backups.find((_) => _.toolId === toolId)

    if (!tool) {
      throw new NotFoundException('ToolNotFound')
    }

    await this.backupTool(tool)
  }

  async backupTool(tool: ToolBackup) {
    if (this.controller) throw new ConflictException()
    else {
      this.controller = new AbortController()
    }
    const time = Date.now()

    this.logger.log(`Starting backup ${tool.folderName}`, `BackupJob.${tool.toolId}`)

    if (tool.commands) {
      await this.setMaintenanceStatus(tool.toolId)
      await lastValueFrom(this.nativeService.executeCommand(tool.commands.stop, this.controller.signal))

      this.logger.log(`Stopped ${tool.folderName}`, `BackupJob.${tool.toolId}`)
    } else {
      this.logger.debug(`No commands for ${tool.folderName}`, `BackupJob.${tool.toolId}`)
    }

    this.logger.log(`Starting sync for folder ${tool.folderName}`, `BackupJob.${tool.toolId}`)
    this.syncFolder(tool.folderName, tool.basePath, this.controller)
    this.logger.log(`Successfully synced folder ${tool.folderName}`, `BackupJob.${tool.toolId}`)

    if (tool.commands) {
      await lastValueFrom(this.nativeService.executeCommand(tool.commands.start, this.controller.signal))
      this.logger.log(`Restarted ${tool.folderName}`, `BackupJob.${tool.toolId}`)
      await this.clearMaintenanceStatus(tool.toolId)
    }

    const downtime = Date.now() - time
    // TODO:
    const rawSize = 'TODO:'

    await this.createBackup(tool.toolId, {
      downtime: tool.commands ? downtime : 0,
      duration: Date.now() - time,
      rawSize,
    })

    this.controller = undefined
    this.logger.log(`Successfully ran backup job`, `BackupJob.${tool.toolId}`)
  }
}
