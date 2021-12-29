import { LogService } from '@dashy/util/logger'
import { Test, TestingModule } from '@nestjs/testing'
import { ToolFileService } from './tool-file.service'

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>
const mockLogService: MockService<LogService> = {}

describe('ToolFileService', () => {
  let service: ToolFileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolFileService, { provide: LogService, useValue: mockLogService }],
    }).compile()

    service = module.get<ToolFileService>(ToolFileService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
