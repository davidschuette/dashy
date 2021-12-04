import { BackupDto, StorageDto, ToolDto } from '@dashy/api-interfaces'
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly backupService: BackupService) {}

  @Get('data')
  getData() {
    return this.appService.getData()
  }

  @Get('tools')
  @ApiTags('Tools')
  @ApiOkResponse({ type: ToolDto, isArray: true })
  getTools(): Promise<ToolDto[]> {
    return this.appService.getTools()
  }

  @Get('storage')
  @ApiTags('Storage')
  @ApiOkResponse({ type: StorageDto })
  getStorage(): Promise<StorageDto> {
    return this.appService.getStorage()
  }

  @Post('tools/:toolName/maintenance')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiTags('Tools')
  setMaintenanceStatus(@Param('toolName') toolName: string): void {
    return this.appService.setMaintenanceStatus(toolName)
  }

  @Delete('tools/:toolName/maintenance')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiTags('Tools')
  clearMaintenanceStatus(@Param('toolName') toolName: string): void {
    return this.appService.clearMaintenanceStatus(toolName)
  }

  @Post('backups')
  @ApiTags('Backups')
  createBackup(@Body() data: BackupDto): void {
    return this.backupService.createBackup(data)
  }

  @Get('backups')
  @ApiTags('Backups')
  @ApiOkResponse({ type: BackupDto, isArray: true })
  getBackups(): BackupDto[] {
    return this.backupService.getBackups()
  }
}
