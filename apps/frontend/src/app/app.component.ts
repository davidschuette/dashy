import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { DashboardService } from './dashboard/services/dashboard.service'
import { Observable, of } from 'rxjs'
import { StorageDto } from '@dashy/api-interfaces'

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
