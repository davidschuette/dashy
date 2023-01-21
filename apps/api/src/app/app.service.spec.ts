import { ToolDto } from '@dashy/api-interfaces'
import { LogService } from '@dashy/util/logger'
import { HttpService } from '@nestjs/axios'
import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { of } from 'rxjs'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'
import { Sqlite3Service } from './sqlite3/services/sqlite3.service'

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>
const mockHttpService: MockService<HttpService> = { get: jest.fn() }
const mockBackupService: MockService<BackupService> = { getLastBackupTime: jest.fn() }
const mockSqlite3Service: MockService<Sqlite3Service> = { get: jest.fn(), getOne: jest.fn(), run: jest.fn() }
const mockLogService: MockService<LogService> = {}

describe('AppService', () => {
  let service: AppService
  let httpService: MockService<HttpService>
  let backupService: MockService<BackupService>
  let sqlite3Service: MockService<Sqlite3Service>
  let logService: MockService<LogService>

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: LogService, useValue: mockLogService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: BackupService, useValue: mockBackupService },
        { provide: Sqlite3Service, useValue: mockSqlite3Service },
      ],
    }).compile()

    service = app.get<AppService>(AppService)
    httpService = app.get(HttpService)
    backupService = app.get(BackupService)
    sqlite3Service = app.get(Sqlite3Service)
    logService = app.get(LogService)
  })

  describe('getTools', () => {
    it('should return OFFLINE status', async () => {
      const tool = new ToolDto()
      const tools: ToolDto[] = [
        Object.assign(tool, {
          name: 'name',
          description: 'desc',
          url: 'url',
          img: 'img',
          accountCreation: 1,
          lastBackup: 100,
          status: 1,
        }),
      ]

      mockSqlite3Service.get.mockReturnValueOnce([
        {
          name: 'name',
          description: 'desc',
          url: 'url',
          img: 'img',
          containerNames: ['cName1', 'cName2'],
          accountCreation: 1,
          isInMaintenance: false,
        },
      ])

      mockHttpService.get.mockReturnValueOnce(
        of({
          data: {
            status: 'string',
            data: {
              resultType: 'string',
              result: [
                {
                  metric: {
                    __name__: 'string',
                    instance: 'string',
                    job: 'string',
                    name: 'cName1',
                  },
                  value: [1, '0'],
                },
                {
                  metric: {
                    __name__: 'string',
                    instance: 'string',
                    job: 'string',
                    name: 'cName2',
                  },
                  value: [1, '1'],
                },
              ],
            },
          },
        })
      )

      mockBackupService.getLastBackupTime.mockReturnValueOnce(100)

      const result = await service.getTools()

      expect(result).toStrictEqual(tools)
    })

    it('should return ONLINE status', async () => {
      const tool = new ToolDto()
      const tools: ToolDto[] = [
        Object.assign(tool, {
          name: 'name',
          description: 'desc',
          url: 'url',
          img: 'img',
          accountCreation: 1,
          lastBackup: 100,
          status: 0,
        }),
      ]

      mockSqlite3Service.get.mockReturnValueOnce([
        {
          name: 'name',
          description: 'desc',
          url: 'url',
          img: 'img',
          containerNames: ['cName1', 'cName2'],
          accountCreation: 1,
          isInMaintenance: false,
        },
      ])

      mockHttpService.get.mockReturnValueOnce(
        of({
          data: {
            status: 'string',
            data: {
              resultType: 'string',
              result: [
                {
                  metric: {
                    __name__: 'string',
                    instance: 'string',
                    job: 'string',
                    name: 'cName1',
                  },
                  value: [1, '1'],
                },
                {
                  metric: {
                    __name__: 'string',
                    instance: 'string',
                    job: 'string',
                    name: 'cName2',
                  },
                  value: [1, '1'],
                },
              ],
            },
          },
        })
      )

      mockBackupService.getLastBackupTime.mockReturnValueOnce(100)

      const result = await service.getTools()

      expect(result).toStrictEqual(tools)
    })

    it('should return MAINTENANCE status', async () => {
      const tool = new ToolDto()
      const tools: ToolDto[] = [
        Object.assign(tool, {
          name: 'name',
          description: 'desc',
          url: 'url',
          img: 'img',
          accountCreation: 1,
          lastBackup: 100,
          status: 2,
        }),
      ]

      mockSqlite3Service.get.mockReturnValueOnce([
        {
          name: 'name',
          description: 'desc',
          url: 'url',
          img: 'img',
          containerNames: ['cName1', 'cName2'],
          accountCreation: 1,
          isInMaintenance: true,
        },
      ])

      mockHttpService.get.mockReturnValueOnce(
        of({
          data: {
            status: 'string',
            data: {
              resultType: 'string',
              result: [
                {
                  metric: {
                    __name__: 'string',
                    instance: 'string',
                    job: 'string',
                    name: 'cName1',
                  },
                  value: [1, '1'],
                },
                {
                  metric: {
                    __name__: 'string',
                    instance: 'string',
                    job: 'string',
                    name: 'cName2',
                  },
                  value: [1, '1'],
                },
              ],
            },
          },
        })
      )

      mockBackupService.getLastBackupTime.mockReturnValueOnce(100)

      const result = await service.getTools()

      expect(result).toStrictEqual(tools)
    })
  })

  describe('getStorage', () => {})

  describe('clearMaintenanceStatus', () => {
    describe('when tool exists', () => {
      it('should update tool array', () => {
        const tools = [
          {
            name: 'name',
            description: 'desc',
            url: 'url',
            img: 'img',
            containerNames: ['cName1', 'cName2'],
            accountCreation: 1,
            isInMaintenance: true,
          },
        ]
        mockSqlite3Service.get.mockImplementation(() => tools)

        expect(service.clearMaintenanceStatus('name')).toBeUndefined()
        expect(tools[0].isInMaintenance).toEqual(false)
      })
    })

    describe('otherwise', () => {
      it('should throw NotFoundException', () => {
        const tools = [
          {
            name: 'name',
            description: 'desc',
            url: 'url',
            img: 'img',
            containerNames: ['cName1', 'cName2'],
            accountCreation: 1,
            isInMaintenance: true,
          },
        ]
        mockSqlite3Service.get.mockImplementation(() => tools)

        try {
          expect(service.clearMaintenanceStatus('not name')).not.toBeUndefined()
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException)
          expect(error.message).toEqual('ToolNotFound')
        }
      })
    })
  })

  describe('setMaintenanceStatus', () => {
    describe('when tool exists', () => {
      it('should update tool array', () => {
        const tools = [
          {
            name: 'name',
            description: 'desc',
            url: 'url',
            img: 'img',
            containerNames: ['cName1', 'cName2'],
            accountCreation: 1,
            isInMaintenance: false,
          },
        ]
        mockSqlite3Service.get.mockImplementation(() => tools)

        expect(service.setMaintenanceStatus('name')).toBeUndefined()
        expect(tools[0].isInMaintenance).toEqual(true)
      })
    })

    describe('otherwise', () => {
      it('should throw NotFoundException', () => {
        const tools = [
          {
            name: 'name',
            description: 'desc',
            url: 'url',
            img: 'img',
            containerNames: ['cName1', 'cName2'],
            accountCreation: 1,
            isInMaintenance: true,
          },
        ]
        mockSqlite3Service.get.mockImplementation(() => tools)

        try {
          expect(service.setMaintenanceStatus('not name')).not.toBeUndefined()
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException)
          expect(error.message).toEqual('ToolNotFound')
        }
      })
    })
  })
})
