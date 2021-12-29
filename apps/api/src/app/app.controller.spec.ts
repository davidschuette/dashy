import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>
const mockAppService: MockService<AppService> = {}
const mockBackupService: MockService<BackupService> = {}

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockAppService },
        { provide: BackupService, useValue: mockBackupService },
      ],
    }).compile()
  })

  it('should be defined', () => {
    expect(app.get<AppController>(AppController)).toBeDefined()
  })
})
