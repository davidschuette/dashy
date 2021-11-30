import { Component, OnInit } from '@angular/core'
import { StorageDto } from '@dashy/api-interfaces'
import { Observable } from 'rxjs'
import { DashboardService } from './dashboard/services/dashboard.service'

@Component({
  selector: 'dashy-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  storage$: Observable<StorageDto>

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit() {
    this.storage$ = this.dashboardService.getStorage()
  }
}
