import { Injectable, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom, map } from 'rxjs'
import { AccountCreation, StorageDto, ToolDto, ToolStatus } from '@dashy/api-interfaces'
import { exec } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { BackupService } from './backup/backup.service'

@Injectable()
export class AppService {
  private readonly STORAGE_PATH = 'tools.json'
  private tools = [
    {
      name: 'Overleaf',
      description:
        'Overleaf ist ein online LaTeX Kollaborationstool. Es ist keine Installation erforderlich. Zudem gibt es einen vollständigen Änderungsverlauf.',
      url: 'https://overleaf.lyop.de',
      img: 'overleaf.svg',
      containerNames: ['sharelatex', 'redis', 'mongo'],
      accountCreation: AccountCreation.ON_REQUEST,
      isInMaintenance: false,
    },
    {
      name: 'Nextcloud',
      description: `Nextcloud ist eine Software für das Speichern von Daten (Filehosting).
Bei Einsatz eines Clients wird der Server automatisch mit einem lokalen Verzeichnis synchronisiert. Dadurch kann von mehreren Rechnern, aber auch über eine Weboberfläche, auf einen konsistenten Datenbestand zugegriffen werden.
Ebenfalls sind Videokonferenzen und das „Teilen“ des eigenen Bildschirms möglich. Alle Daten auf der Nextcloud sind End-to-End verschlüsselt. Mit Nextcloud behält der Besitzer die vollständige Kontrolle über seine Daten, und Möglichkeiten für Datenmissbrauch werden reduziert.`,
      url: 'https://next.lyop.de',
      img: 'nextcloud.svg',
      containerNames: ['nextcloud_app_1', 'nextcloud_db_1'],
      accountCreation: AccountCreation.ON_REQUEST,
      isInMaintenance: false,
    },
    {
      name: 'Send',
      description: `Mit Send kannst du Dateien sicher mit anderen teilen – mit End-to-End-Verschlüsselung und einem Freigabe-Link, der automatisch abläuft.
So bleiben deine geteilten Inhalte privat und du kannst sicherstellen, dass deine Daten nicht für immer im Web herumschwirren.`,
      url: 'https://send.lyop.de',
      img: 'send.svg',
      containerNames: ['send_send_1', 'send_redis_1'],
      accountCreation: AccountCreation.NO_ACCOUNT,
      isInMaintenance: false,
    },
    {
      name: 'BitWarden',
      description:
        'BitWarden ist ein online Password-Manager. Es gibt Clients für alle gängien Geräte. Alle Passwörter werden zwischen den Geräten synchronisiert.',
      url: 'https://bitwarden.lyop.de',
      img: 'bitwarden.svg',
      containerNames: [
        'bitwarden-nginx',
        'bitwarden-admin',
        'bitwarden-portal',
        'bitwarden-attachments',
        'bitwarden-web',
        'bitwarden-mssql',
        'bitwarden-sso',
        'bitwarden-events',
        'bitwarden-identity',
        'bitwarden-icons',
        'bitwarden-api',
        'bitwarden-notifications',
      ],
      accountCreation: AccountCreation.SELF,
      isInMaintenance: false,
    },
    {
      name: 'Plex',
      description: 'Filme und Serien, die es sonst nirgends gibt.',
      url: 'https://plex.lyop.de',
      img: 'plex.png',
      containerNames: [],
      accountCreation: AccountCreation.ON_REQUEST,
      isInMaintenance: false,
    },
  ]

  constructor(private readonly http: HttpService, private readonly backupService: BackupService) {
    this.loadFromDrive()
  }

  private loadFromDrive() {
    this.tools = JSON.parse(readFileSync(this.STORAGE_PATH).toString())
  }

  private flushToDrive() {
    writeFileSync(this.STORAGE_PATH, JSON.stringify(this.tools))
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
