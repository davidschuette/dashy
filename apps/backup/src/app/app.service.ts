import { Injectable } from '@nestjs/common'
import { exec } from 'child_process'
import { ToolBackup } from './models/tool-backup'

@Injectable()
export class AppService {
  private readonly BASE_PATH = '/home/dave/deployment'
  getData(): { message: string } {
    return { message: 'Welcome to backup!' }
  }

  constructor() {
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
    console.log(`Archived ${tool.folderName}`)
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
}
