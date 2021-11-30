import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { StorageDto } from '@dashy/api-interfaces'

@Component({
  selector: 'dashy-storage-bar',
  templateUrl: './storage-bar.component.html',
  styleUrls: ['./storage-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageBarComponent {
  @Input()
  storage: StorageDto | null
}
