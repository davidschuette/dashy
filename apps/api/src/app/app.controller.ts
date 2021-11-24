import { BackupDto } from '@dashy/api-interfaces'
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
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
  getTools() {
    return this.appService.getTools()
  }

  @Get('storage')
  getStorage() {
    return this.appService.getStorage()
  }

  @Post('tools/:toolName/maintenance')
  setMaintenanceStatus(@Param('toolName') toolName: string) {
    return this.appService.setMaintenanceStatus(toolName)
  }

  @Delete('tools/:toolName/maintenance')
  clearMaintenanceStatus(@Param('toolName') toolName: string) {
    return this.appService.clearMaintenanceStatus(toolName)
  }

  @Post('backups')
  createBackup(@Body() data: BackupDto) {
    return this.backupService.createBackup(data)
  }

  @Get('backups')
  getBackups(): BackupDto[] {
    return this.backupService.getBackups()
  }
}
