import { Component, OnInit } from '@angular/core'
import { BackupDto } from '@dashy/api-interfaces'
import { Observable } from 'rxjs'
import { DashboardService } from '../../services/dashboard.service'

@Component({
  selector: 'dashy-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss'],
})
export class BackupComponent implements OnInit {
  backups$: Observable<BackupDto[]>

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit() {
    this.backups$ = this.dashboardService.getBackups()
  }
}
