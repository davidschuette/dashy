import { LogService } from '@dashy/util/logger'
import { Injectable } from '@nestjs/common'
import { readFileSync, writeFileSync } from 'fs'
import { environment } from '../../environments/environment'
import { Tool } from '../models/tool.model'

@Injectable()
export class ToolFileService {
  private tools: Tool[]

  constructor(private readonly logger: LogService) {}

  loadFromDrive(): void {
    try {
      this.tools = JSON.parse(readFileSync(environment.storage.tools).toString())
    } catch (e) {
      this.logger.warn(`Could not load file '${environment.storage.tools}', initialising with initTools from configuration`)
      this.tools = environment.initTools
    }
  }

  flushToDrive(): void {
    writeFileSync(environment.storage.tools, JSON.stringify(this.tools))
  }

  getTools(): Tool[] {
    return this.tools
  }
}
