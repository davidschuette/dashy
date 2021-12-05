import { BackupDto, StorageDto, ToolDto } from '@dashy/api-interfaces'
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'
import { AuthGuard } from './auth/auth.guard'
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
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiTags('Tools')
  @ApiBearerAuth()
  setMaintenanceStatus(@Param('toolName') toolName: string): void {
    return this.appService.setMaintenanceStatus(toolName)
  }

  @Delete('tools/:toolName/maintenance')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiTags('Tools')
  @ApiBearerAuth()
  clearMaintenanceStatus(@Param('toolName') toolName: string): void {
    return this.appService.clearMaintenanceStatus(toolName)
  }

  @Post('backups')
  @UseGuards(AuthGuard)
  @ApiTags('Backups')
  @ApiBearerAuth()
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
