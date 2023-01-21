import { CreateToolDto, ToolDto, ToolStatus } from '@dashy/api-interfaces'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { BackupService } from '../../backup/services/backup.service'
import { Tool } from '../../models/tool.model'
import { Sqlite3Service } from '../../sqlite3/services/sqlite3.service'

@Injectable()
export class ToolService {
  constructor(private readonly sqlite3Service: Sqlite3Service, private readonly backupService: BackupService) {}

  async getTools(): Promise<ToolDto[]> {
    // const states = await firstValueFrom(
    //   this.http
    //     .get<{
    //       status: string
    //       data: {
    //         resultType: string
    //         result: {
    //           metric: {
    //             __name__: string
    //             instance: string
    //             job: string
    //             name: string
    //           }
    //           value: [number, '1' | '0']
    //         }[]
    //       }
    //     }>(`http://${environment.prometheusHost}/api/v1/query?query=docker_container_running_state`)
    //     .pipe(map((_) => _.data.data.result))
    // )
    const states = []

    const tools = await this.sqlite3Service.get<Tool>(
      `SELECT tool.id, tool.name, tool.description, tool.img, tool.url, tool.accountCreation, backup.date, tool.isInMaintenance, JSON_GROUP_ARRAY(container.name) as containerNames FROM tool LEFT OUTER JOIN container ON container.tool = tool.id LEFT OUTER JOIN backup ON backup.tool = tool.id GROUP BY tool.id`
    )

    const processedTools = await Promise.all(
      tools.map(async (tool) => {
        const dto = new ToolDto()

        dto.id = tool.id
        dto.name = tool.name
        dto.description = tool.description
        dto.img = tool.img
        dto.url = tool.url
        dto.accountCreation = tool.accountCreation

        dto.lastBackup = (await this.backupService.getLastBackupTime(tool.id)) || 0

        if (tool.isInMaintenance) {
          dto.status = ToolStatus.MAINTENANCE
        } else {
          dto.status = (JSON.parse(tool.containerNames) as string[])
            .filter((_) => !!_)
            .every((name) => states.find((_) => _.metric.name === name)?.value[1] === '1' || false)
            ? ToolStatus.ONLINE
            : ToolStatus.OFFLINE
        }

        return dto
      })
    )

    return processedTools
  }

  async createTool(data: CreateToolDto): Promise<void> {
    const id = randomUUID()
    await this.sqlite3Service.run(`INSERT INTO tool VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      id,
      data.name,
      data.description,
      data.url,
      data.img,
      data.accountCreation,
      false,
    ])
  }

  async deleteTool(toolId: string): Promise<void> {
    await this.sqlite3Service.run(`DELETE FROM tool WHERE id = ?`, [toolId])
  }
}
