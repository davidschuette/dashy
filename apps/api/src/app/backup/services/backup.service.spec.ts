import { Backup, BackupDto, CreateBackupDto } from '@dashy/api-interfaces'
import { Test, TestingModule } from '@nestjs/testing'
import { BackupService } from './backup.service'

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>
const mockFileService: MockService<FileService> = {
  flushToDrive: jest.fn(),
  loadFromDrive: jest.fn(),
}

const defaultBackupData: Backup[] = [
  new Backup(new Date(4), 3, 'tN3', 3, 3, 'rS3', 'cS3', 'img3'),
  new Backup(new Date(3), 3, 'tN3', 3, 3, 'rS3', 'cS3', 'img3'),
  new Backup(new Date(2), 2, 'tN2', 2, 2, 'rS2', 'cS2', 'img2'),
  new Backup(new Date(1), 1, 'tN1', 1, 1, 'rS1', 'cS1', 'img1'),
]
const defaultBackupDataLength = defaultBackupData.length

mockFileService.loadFromDrive.mockReturnValue([...defaultBackupData])
mockFileService.flushToDrive.mockReturnValue(undefined)

describe('BackupService', () => {
  let service: BackupService
  let fileService: MockService<FileService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackupService, { provide: FileService, useValue: mockFileService }],
    }).compile()

    service = module.get<BackupService>(BackupService)
    fileService = module.get<MockService<FileService>>(FileService)

    // @ts-expect-error
    service.backups = [...defaultBackupData]
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createBackups', () => {
    it('should update backups array', () => {
      const newBackup: CreateBackupDto = { compressedSize: 'cS4', compression: 4, downtime: 4, rawSize: 'rS4', duration: 4 }
      const { downtime, compressedSize, compression, duration, rawSize } = newBackup

      expect(service.createBackup(newBackup)).toBeUndefined()
      // @ts-expect-error
      expect(service.backups).toStrictEqual([backup, ...defaultBackupData])
    })
  })

  describe('getBackups', () => {
    it('should return backups', () => {
      const expectedBackups: BackupDto[] = defaultBackupData.map(({ date, ...rest }) => ({ date: date.getTime(), ...rest }))

      expect(service.getBackups(defaultBackupDataLength)).toStrictEqual(expectedBackups)
    })
  })

  describe('getLastBackupTime', () => {
    it('should return time if tool exists', () => {
      const expectedTime = 4

      expect(service.getLastBackupTime('tN3')).toEqual(expectedTime)
    })

    it('should return undefined if tool does not exist', () => {
      expect(service.getLastBackupTime('not-existing')).toBeUndefined()
    })
  })
})
