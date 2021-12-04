import { Injectable, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom, map } from 'rxjs'
import { AccountCreation, StorageDto, ToolDto, ToolStatus } from '@dashy/api-interfaces'
import { exec } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { BackupService } from './backup/backup.service'
import { environment } from '../environments/environment'
import { Tool } from './models/tool.model'
import { LogService } from '@dashy/util/logger'

@Injectable()
export class AppService {
  private tools: Tool[]

  constructor(private readonly http: HttpService, private readonly backupService: BackupService, private readonly logger: LogService) {
    this.loadFromDrive()
  }

  private loadFromDrive() {
    try {
      this.tools = JSON.parse(readFileSync(environment.storage.tools).toString())
    } catch (e) {
      this.logger.warn(`Could not load file '${environment.storage.tools}', initialising with initTools from configuration`)
      this.tools = environment.initTools
    }
  }

  private flushToDrive() {
    writeFileSync(environment.storage.tools, JSON.stringify(this.tools))
  }

  async getTools(): Promise<ToolDto[]> {
    const states = await firstValueFrom(
      this.http
        .get<{
          status: string
          data: {
            resultType: string
            result: {
              metric: {
                __name__: string
                instance: string
                job: string
                name: string
              }
              value: [number, '1' | '0']
            }[]
          }
        }>('http://prometheus:9090/api/v1/query?query=docker_container_running_state')
        .pipe(map((_) => _.data.data.result))
    )

    const tools = this.tools.map((tool) => {
      const dto = new ToolDto()
      dto.name = tool.name
      dto.description = tool.description
      dto.img = tool.img
      dto.url = tool.url
      dto.accountCreation = tool.accountCreation

      dto.lastBackup = this.backupService.getLastBackupTime(tool.name) || 0

      if (tool.isInMaintenance) {
        dto.status = ToolStatus.MAINTENANCE
      } else {
        dto.status = tool.containerNames.every((name) => states.find((_) => _.metric.name === name)?.value[1] === '1' || false)
          ? ToolStatus.ONLINE
          : ToolStatus.OFFLINE
      }

      return dto
    })

    return tools
  }

  getData() {
    return this.http
      .get<{
        status: string
        data: {
          resultType: string
          result: {
            metric: {
              __name__: string
              instance: string
              job: string
              name: string
            }
            value: [number, number]
          }[]
        }
      }>('http://prometheus:9090/api/v1/query?query=docker_container_running_state')
      .pipe(map((_) => _.data.data.result))
  }

  getStorage(): Promise<StorageDto> {
    return new Promise((resolve) => {
      const process = exec(`df -h / | tail -n 1 | awk '{ print $4,$5 }'`)
      let result = ''

      process.stdout.on('data', (data: string) => {
        result += data
      })

      process.on('exit', () => {
        const values = result.split(' ')
        const res: StorageDto = {
          remaining: values[0],
          percent: parseInt(values[1].replace('%', ''), 10),
        }

        resolve(res)
      })
    })
  }

  clearMaintenanceStatus(toolName: string) {
    const tool = this.tools.find((_) => _.name === toolName)

    if (!tool) throw new NotFoundException('ToolNotFound')

    tool.isInMaintenance = false
    this.flushToDrive()
  }

  setMaintenanceStatus(toolName: string) {
    const tool = this.tools.find((_) => _.name === toolName)

    if (!tool) throw new NotFoundException('ToolNotFound')

    tool.isInMaintenance = true
    this.flushToDrive()
  }
}
