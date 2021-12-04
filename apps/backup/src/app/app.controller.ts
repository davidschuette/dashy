import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller('backups')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post(':toolName/trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerBackup(@Param('toolName') toolName: string) {
    return this.appService.triggerBackup(toolName)
  }
}
