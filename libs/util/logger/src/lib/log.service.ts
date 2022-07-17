import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class LogService extends Logger {
  private getCaller(): string {
    const re = /([^(]+)@|at ([^(]+) \(/g

    try {
      throw new Error()
    } catch (e) {
      if (e instanceof Error) {
        const callerList = e.stack.split('\n')
        const caller = re.exec(callerList.slice(3).join('\n'))[2]

        if (caller.includes('<anonymous>')) {
          return callerList[8].split(' ')[5]
        }

        if (caller.startsWith('new ')) {
          return caller.replace('new ', '') + '.constructor'
        } else return caller
      }
    }
  }

  debug(message: string, context?: string) {
    const caller = context || this.getCaller()

    super.debug(message, caller)
  }

  error(message: string, stack?: string, context?: string) {
    const caller = context || this.getCaller()

    super.error(message, stack, caller)
  }

  log(message: string, context?: string) {
    const caller = context || this.getCaller()

    super.log(message, caller)
  }

  verbose(message: string, context?: string) {
    const caller = context || this.getCaller()

    super.verbose(message, caller)
  }

  warn(message: string, context?: string) {
    const caller = context || this.getCaller()

    super.warn(message, caller)
  }
}
