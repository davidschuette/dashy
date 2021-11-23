import { Component, OnInit } from '@angular/core'
import { StorageDto } from '@dashy/api-interfaces'
import { Observable } from 'rxjs'
import { DashboardService } from '../../services/dashboard.service'

@Component({
  selector: 'dashy-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit {
  storage$: Observable<StorageDto>

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.storage$ = this.dashboardService.getStorage()
  }
}
