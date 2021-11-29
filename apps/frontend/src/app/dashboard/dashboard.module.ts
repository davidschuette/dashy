import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ToolCardComponent } from './components/tool-card/tool-card.component'
import { ToolCardGalleryComponent } from './containers/tool-card-gallery/tool-card-gallery.component'
import { StorageBarComponent } from './components/storage-bar/storage-bar.component'
import { DashboardService } from './services/dashboard.service'
import { HttpClientModule } from '@angular/common/http'
import { PageComponent } from './containers/page/page.component'
import { TimeDiffPipe } from '../pipes/time-diff.pipe';
import { BackupComponent } from './containers/backup/backup.component';
import { BackupCardComponent } from './components/backup-card/backup-card.component'

@NgModule({
  providers: [DashboardService],
  declarations: [ToolCardComponent, ToolCardGalleryComponent, StorageBarComponent, PageComponent, TimeDiffPipe, BackupComponent, BackupCardComponent],
  imports: [CommonModule, HttpClientModule],
  exports: [PageComponent],
})
export class DashboardModule {}
