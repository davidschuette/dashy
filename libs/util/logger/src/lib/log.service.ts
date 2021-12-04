import { Injectable, Logger, Param } from '@nestjs/common'

@Injectable()
export class LogService extends Logger {
  private getCaller(): string {
    const re = /([^(]+)@|at ([^(]+) \(/g

    try {
      throw new Error()
    } catch (e) {
      if (e instanceof Error) {
        const caller = re.exec(e.stack.split('\n').slice(3).join('\n'))[2]

        if (caller.startsWith('new ')) {
          return caller.replace('new ', '') + '.constructor'
        } else return caller
      }
    }
  }

  debug(message: string) {
    const caller = this.getCaller()

    super.debug(message, caller)
  }

  error(message: string, stack?: string) {
    const caller = this.getCaller()

    super.error(message, stack, caller)
  }

  log(message: string) {
    const caller = this.getCaller()

    super.log(message, caller)
  }

  verbose(message: string) {
    const caller = this.getCaller()

    super.verbose(message, caller)
  }

  warn(message: string) {
    const caller = this.getCaller()

    super.warn(message, caller)
  }
}
