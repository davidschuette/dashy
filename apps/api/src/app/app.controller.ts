import { BackupDto, StorageDto, ToolDto } from '@dashy/api-interfaces'
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiAcceptedResponse, ApiBearerAuth, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { environment } from '../environments/environment'
import { AppService } from './app.service'
import { AuthGuard } from './auth/auth.guard'
import { BackupService } from './backup/services/backup.service'
import { ToolService } from './tool/services/tool.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly backupService: BackupService, private readonly toolService: ToolService) {}

  @Get('data')
  getData() {
    return this.appService.getData()
  }

  @Get('tools')
  @ApiTags('Tools')
  @ApiOkResponse({ type: ToolDto, isArray: true })
  getTools(): Promise<ToolDto[]> {
    return this.toolService.getTools()
  }

  @Get('storage')
  @ApiTags('Storage')
  @ApiOkResponse({ type: StorageDto })
  getStorage(): Promise<StorageDto> {
    return this.appService.getStorage()
  }

  @Post('tools/:toolId/backup')
  @UseGuards(AuthGuard)
  @ApiTags('Backups')
  @ApiBearerAuth()
  createBackup(@Param('toolId') toolId: string, @Body() data: BackupDto): Promise<void> {
    return this.backupService.createBackup(toolId, data)
  }

  @Get('backups')
  @ApiTags('Backups')
  @ApiOkResponse({ type: BackupDto, isArray: true })
  @ApiQuery({ name: 'length', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  getBackups(@Query('length') length: number, @Query('skip') skip?: number): Promise<BackupDto[]> {
    return this.backupService.getBackups(length, skip)
  }

  @Post('backups/:toolId/trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ description: 'The backup job has been trigger and will run in the background.' })
  @ApiParam({ name: 'toolId', enum: environment.backups.map((_) => _.toolId) })
  triggerBackup(@Param('toolId') toolId: string): Promise<void> {
    return this.backupService.triggerBackup(toolId)
  }
}
