import { StorageDto } from '@dashy/api-interfaces'
import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { exec } from 'child_process'
import { map, Observable } from 'rxjs'
import { environment } from '../environments/environment'
import { BackupService } from './backup/services/backup.service'
import { Sqlite3Service } from './sqlite3/services/sqlite3.service'

@Injectable()
export class AppService {
  constructor(private readonly http: HttpService, private readonly backupService: BackupService, private readonly sqlite3Service: Sqlite3Service) {}

  getData(): Observable<
    {
      metric: {
        __name__: string
        instance: string
        job: string
        name: string
      }
    }[]
  > {
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
      }>(`http://${environment.prometheusHost}/api/v1/query?query=docker_container_running_state`)
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
}
