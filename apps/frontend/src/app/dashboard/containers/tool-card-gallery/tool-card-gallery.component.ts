import { Component, OnInit } from '@angular/core'
import { ToolDto } from '@dashy/api-interfaces'
import { Observable, of } from 'rxjs'
import { DashboardService } from '../../services/dashboard.service'

@Component({
  selector: 'dashy-tool-card-gallery',
  templateUrl: './tool-card-gallery.component.html',
  styleUrls: ['./tool-card-gallery.component.scss'],
})
export class ToolCardGalleryComponent implements OnInit {
  tools$: Observable<ToolDto[]> = of([])

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit() {
    this.tools$ = this.dashboardService.getTools()
  }
}
