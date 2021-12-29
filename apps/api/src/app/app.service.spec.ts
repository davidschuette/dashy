import { ToolDto, ToolStatus } from '@dashy/api-interfaces'
import { HttpService } from '@nestjs/axios'
import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { of } from 'rxjs'
import { AppService } from './app.service'
import { BackupService } from './backup/backup.service'
import { ToolFileService } from './tool/tool-file.service'

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>
const mockHttpService: MockService<HttpService> = { get: jest.fn() }
const mockBackupService: MockService<BackupService> = { getLastBackupTime: jest.fn() }
const mockToolFileService: MockService<ToolFileService> = { flushToDrive: jest.fn(), loadFromDrive: jest.fn(), getTools: jest.fn() }

mockToolFileService.flushToDrive.mockReturnValue(undefined)
mockToolFileService.loadFromDrive.mockReturnValue([
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

describe('AppService', () => {
  let service: AppService
  let httpService: MockService<HttpService>
  let backupService: MockService<BackupService>
  let toolFileService: MockService<ToolFileService>

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: BackupService, useValue: mockBackupService },
        { provide: ToolFileService, useValue: mockToolFileService },
      ],
    }).compile()

    service = app.get<AppService>(AppService)
    httpService = app.get(HttpService)
    backupService = app.get(BackupService)
    toolFileService = app.get(ToolFileService)
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

      mockToolFileService.getTools.mockReturnValueOnce([
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

      mockToolFileService.getTools.mockReturnValueOnce([
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

      mockToolFileService.getTools.mockReturnValueOnce([
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
        mockToolFileService.getTools.mockImplementation(() => tools)

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
        mockToolFileService.getTools.mockImplementation(() => tools)

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
        mockToolFileService.getTools.mockImplementation(() => tools)

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
        mockToolFileService.getTools.mockImplementation(() => tools)

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
