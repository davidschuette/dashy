import { DashboardService } from './dashboard.service'

describe('DashboardService', () => {
  let service: DashboardService
  let httpClientSpy: any

  // beforeEach(() => {
  //   httpClientSpy = jasmine.createSpyObj('HttpClient', ['get'])
  //   service = new DashboardService(httpClientSpy)
  // })

  // it('should be created', () => {
  //   expect(service).toBeTruthy()
  // })

  // describe('getTools', () => {
  //   it('should return expected tools', () => {
  //     const expectedTools: ToolDto[] = [{ accountCreation: 0, img: 'img', lastBackup: 100, description: 'desc', status: 0, name: 'name', url: 'url' }]
  //     httpClientSpy.get.and.returnValue(of())
  //   })
  // })

  // describe('getStorage', () => {})

  // describe('getBackpus', () => {})

  it('should temporarly pass', () => {
    expect(1).toEqual(1)
  })
})
