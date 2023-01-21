import { LogService } from '@dashy/util/logger'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { exec } from 'child_process'
import { BehaviorSubject, Observable } from 'rxjs'
import { ResticStatus } from '../enums/ResticStatus.enum'
import { ResticResponse } from '../models/restic-response.type'

@Injectable()
export class NativeService implements OnModuleInit {
  private readonly REQUIREMENTS = ['restic', 'ssh']

  constructor(private readonly logger: LogService) {}

  async onModuleInit() {
    const requirementsFulfilled = await this.checkRequirements()

    if (!requirementsFulfilled) {
      this.logger.debug(`Some commands where not found, check if all requirements are met: ${this.REQUIREMENTS.join(', ')}`, 'NativeService.onModuleInit')
    }
  }

  executeCommand(command: string, signal: AbortSignal, env?: Record<string, string>): Observable<unknown> {
    const c = exec(command, { env: { ...process.env, ...env }, shell: 'bash', signal })
    const subject = new BehaviorSubject<ResticResponse>({ message_type: ResticStatus.STATUS, percent_done: 0, total_bytes: 0, total_files: 0 })

    c.stdout.on('data', (message) => subject.next(message))
    c.stderr.on('data', (message) => subject.error(message))
    c.on('exit', () => subject.complete())

    return subject.asObservable()
  }

  async checkRequirements(): Promise<boolean> {
    return new Promise((resolve) => {
      const c = exec(`which ${this.REQUIREMENTS.join(' ')}`)

      c.on('error', (err) => this.logger.error(err.toString(), err.stack, 'NativeService.executeCommand'))

      c.on('exit', () => resolve(c.exitCode === 0))
    })
  }
}
