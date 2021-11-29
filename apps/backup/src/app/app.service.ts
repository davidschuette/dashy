import { Injectable } from '@nestjs/common'
import { exec } from 'child_process'
import { ToolBackup } from './models/tool-backup'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class AppService {
  private readonly BASE_PATH = '/home/dave/deployment'
  private readonly API_PATH = 'http://localhost:2015/api/'
  getData(): { message: string } {
    return { message: 'Welcome to backup!' }
  }

  constructor(private readonly http: HttpService) {
    this.triggerBackup()
  }

  syncFolder(folderName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = exec(`rsync --delete -az root@lyop.de:${this.BASE_PATH}/${folderName}/ ./${folderName}/`)

      command.on('error', (err) => {
        console.error(err)
        reject()
      })

      command.on('exit', () => {
        resolve()
      })
    })
  }

  executeRemoteCommand(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = exec(`ssh root@lyop.de '${name}'`)

      command.on('error', (err) => {
        console.error(err)
        reject()
      })

      command.on('exit', () => {
        resolve()
      })
    })
  }

  async backupTool(tool: ToolBackup) {
    const time = Date.now()
    console.log(`Starting backup ${tool.folderName}`)
    if (tool.commands) {
      await this.executeRemoteCommand(tool.commands.stop)
      console.log(`Stopped ${tool.folderName}`)
    } else {
      console.log(`No commands ${tool.folderName}`)
    }

    await this.syncFolder(tool.folderName)
    console.log(`Synced folder ${tool.folderName}`)

    if (tool.commands) {
      await this.executeRemoteCommand(tool.commands.start)
      console.log(`Restarted ${tool.folderName}`)
    }

    await this.createArchive(tool)
    const diff = Date.now() - time
    console.log(`Archived ${tool.folderName} in ${diff}ms`)
  }

  createArchive(tool: ToolBackup): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = exec(`tar -cz ${tool.folderName} -f ${tool.archiveName}.tar.gz`)

      command.on('error', (err) => {
        console.error(err)
        reject()
      })

      command.on('exit', () => {
        resolve()
      })
    })
  }

  triggerBackup() {
    this.backupTool({
      archiveName: 'overleaf',
      folderName: 'overleaf',
      commands: {
        start: 'cd /home/dave/deployment/overleaf && docker-compose up -d',
        stop: 'cd /home/dave/deployment/overleaf && docker-compose down',
      },
    })
  }

  setMaintenanceStatus(toolName: string) {
    return firstValueFrom(this.http.post<void>(this.API_PATH + `tools/${toolName}/maintenance`))
  }

  clearMaintenanceStatus(toolName: string) {
    return firstValueFrom(this.http.delete<void>(this.API_PATH + `tools/${toolName}/maintenance`))
  }

  notifyServer() {
    return firstValueFrom(this.http.post<void>(this.API_PATH + 'backups/'))
  }
}
