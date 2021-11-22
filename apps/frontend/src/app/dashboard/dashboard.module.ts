import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ToolCardComponent } from './components/tool-card/tool-card.component'
import { ToolCardGalleryComponent } from './containers/tool-card-gallery/tool-card-gallery.component'
import { StorageBarComponent } from './components/storage-bar/storage-bar.component'

@NgModule({
  declarations: [
    ToolCardComponent,
    ToolCardGalleryComponent,
    StorageBarComponent,
  ],
  imports: [CommonModule],
  exports: [ToolCardGalleryComponent, StorageBarComponent],
})
export class DashboardModule {}
