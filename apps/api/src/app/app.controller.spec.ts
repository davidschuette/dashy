import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>
const mockAppService: MockService<AppService> = {
  getData: jest.fn(),
  getTools: jest.fn(),
  setMaintenanceStatus: jest.fn(),
  clearMaintenanceStatus: jest.fn(),
  getStorage: jest.fn(),
}
const mockBackupService: MockService<BackupService> = {
  createBackup: jest.fn(),
  getBackups: jest.fn(),
  getLastBackupTime: jest.fn(),
}

describe('AppController', () => {
  let app: TestingModule
  let controller: AppController

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockAppService },
        { provide: BackupService, useValue: mockBackupService },
      ],
    }).compile()
  })

  beforeEach(async () => {
    controller = app.get<AppController>(AppController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('GET data should return prometheus data', (done) => {
    mockAppService.getData.mockReturnValueOnce(of('sample data from prometheus'))
    controller.getData().subscribe({
      next: (data) => {
        expect(data).toBe('sample data from prometheus')
      },
      complete: () => {
        done()
      },
    })
  })

  it('GET tools should return tools', async () => {
    mockAppService.getTools.mockResolvedValueOnce('sample tool list')
    await expect(controller.getTools()).resolves.toEqual('sample tool list')
  })

  it('GET storage should return storage quota', async () => {
    mockAppService.getStorage.mockResolvedValueOnce('sample storage quota')
    await expect(controller.getStorage()).resolves.toEqual('sample storage quota')
  })

  it('POST tools/{toolName}/maintenance should return response', async () => {
    mockAppService.setMaintenanceStatus.mockResolvedValueOnce('sample response')
    await expect(controller.setMaintenanceStatus('sample tool')).resolves.toEqual('sample response')
  })

  it('DELETE tools/{toolName}/maintenance should return response', async () => {
    mockAppService.clearMaintenanceStatus.mockResolvedValueOnce('sample response2')
    await expect(controller.clearMaintenanceStatus('sample tool 2')).resolves.toEqual('sample response2')
  })

  it('POST backups should accept new backup data', (done) => {
    mockBackupService.createBackup.mockImplementationOnce((data) => {
      expect(data).toEqual({
        date: 1,
        duration: 2380,
        toolName: 'BitWarden',
        compression: 772,
        downtime: 0,
        rawSize: '37M',
        compressedSize: '37M',
        img: 'bitwarden.svg',
      })
      done()
    })

    expect(
      controller.createBackup({
        date: 1,
        duration: 2380,
        toolName: 'BitWarden',
        compression: 772,
        downtime: 0,
        rawSize: '37M',
        compressedSize: '37M',
        img: 'bitwarden.svg',
      })
    )
  })

  it('GET backups should return backup list', async () => {
    mockBackupService.getBackups.mockImplementationOnce((length, skip) => Promise.resolve([length, skip]))
    await expect(controller.getBackups(10, 2)).resolves.toEqual([10, 2])
  })
})
