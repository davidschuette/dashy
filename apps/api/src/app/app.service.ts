import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom, map } from 'rxjs'
import { ToolDto, ToolStatus } from '@dashy/api-interfaces'

@Injectable()
export class AppService {
  private tools = [
    {
      name: 'overleaf',
      description: 'secsascas',
      url: 'https://overleaf.lyop.de',
      img: 'overleaf.svg',
      containerNames: ['code-server', 'dashy_docker-exporter'],
    },
    {
      name: 'test',
      description: 'secsascas',
      url: 'https://overleaf.lyop.de',
      img: 'overleaf.svg',
      containerNames: ['happy_hugle', 'code-server'],
    },
  ]

  constructor(private readonly http: HttpService) {}

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
        }>(
          'http://prometheus:9090/api/v1/query?query=docker_container_running_state'
        )
        .pipe(map((_) => _.data.data.result))
    )

    const tools = this.tools.map((tool) => {
      const dto = new ToolDto()
      dto.name = tool.name
      dto.description = tool.description
      dto.img = tool.img
      dto.url = tool.url
      dto.status = tool.containerNames.every(
        (name) =>
          states.find((_) => _.metric.name === name)?.value[1] === '1' || false
      )
        ? ToolStatus.ONLINE
        : ToolStatus.OFFLINE

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
      }>(
        'http://prometheus:9090/api/v1/query?query=docker_container_running_state'
      )
      .pipe(map((_) => _.data.data.result))
  }
}
