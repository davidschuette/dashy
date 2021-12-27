import { Component, OnInit } from '@angular/core'
import { BackupDto, StorageDto } from '@dashy/api-interfaces'
import { map, Observable } from 'rxjs'
import { DashboardService } from '../../services/dashboard.service'

@Component({
  selector: 'dashy-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit {
  storage$: Observable<StorageDto>
  backups$: Observable<{ [k: string]: BackupDto[] }>

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.storage$ = this.dashboardService.getStorage()

    this.backups$ = this.dashboardService.getBackups().pipe(
      map((_) => {
        const obj: { [k: string]: BackupDto[] } = {}

        _.forEach((backup) => {
          if (!obj[backup.toolName]) {
            obj[backup.toolName] = [backup]
          } else {
            obj[backup.toolName].push(backup)
          }
        })

        return obj
      })
    )
  }
}
