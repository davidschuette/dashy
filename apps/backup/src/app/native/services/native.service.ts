import { LogService } from '@dashy/util/logger'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { exec } from 'child_process'
import { PathLike } from 'fs'
import { readdir, rm } from 'fs/promises'

@Injectable()
export class NativeService implements OnModuleInit {
  private readonly REQUIREMENTS = ['pigz', 'rsync', 'du', 'ssh', 'ls', 'tar']

  constructor(private readonly logger: LogService) {}

  async onModuleInit() {
    const requirementsFulfilled = await this.checkRequirements()

    if (!requirementsFulfilled) {
      this.logger.debug(`Some commands where not found, check if all requirements are met: ${this.REQUIREMENTS.join(', ')}`, 'NativeService.onModuleInit')
    }
  }

  executeCommand(command: string): Promise<string> {
    return new Promise((resolve) => {
      let result = ''
      const c = exec(command)

      c.stdout.on('data', (chunk) => (result += chunk))
      c.on('error', (err) => this.logger.error(err.toString(), err.stack, 'NativeService.executeCommand'))

      c.on('exit', () => resolve(result))
    })
  }

  readdir(path: PathLike) {
    return readdir(path)
  }

  rm(path: PathLike) {
    return rm(path)
  }

  async checkRequirements(): Promise<boolean> {
    return new Promise((resolve) => {
      const c = exec(`which ${this.REQUIREMENTS.join(' ')}`)

      c.on('error', (err) => this.logger.error(err.toString(), err.stack, 'NativeService.executeCommand'))

      c.on('exit', () => resolve(c.exitCode === 0))
    })
  }
}
