import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { StorageDto, ToolDto } from '@dashy/api-interfaces'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  getTools(): Observable<ToolDto[]> {
    return this.http.get<ToolDto[]>('/api/tools')
  }

  getStorage(): Observable<StorageDto> {
    return this.http.get<StorageDto>('/api/storage')
  }
}
