import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiAcceptedResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { environment } from '../environments/environment'
import { AppService } from './app.service'

@Controller('backups')
@ApiTags('Backups')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post(':toolId/trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ description: 'The backup job has been trigger and will run in the background.' })
  @ApiParam({ name: 'toolId', enum: environment.backups.map((_) => _.toolId) })
  triggerBackup(@Param('toolId') toolId: string): void {
    return this.appService.triggerBackup(toolId)
  }
}
