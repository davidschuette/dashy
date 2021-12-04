import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiAcceptedResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { environment } from '../environments/environment'
import { AppService } from './app.service'

@Controller('backups')
@ApiTags('Backups')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post(':toolName/trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ description: 'The backup job has been trigger and will run in the background.' })
  @ApiParam({ name: 'toolName', enum: environment.backups.map((_) => _.toolName) })
  triggerBackup(@Param('toolName') toolName: string): void {
    return this.appService.triggerBackup(toolName)
  }
}
