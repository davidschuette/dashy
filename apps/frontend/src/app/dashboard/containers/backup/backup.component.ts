import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { BackupDto } from '@dashy/api-interfaces'

@Component({
  selector: 'dashy-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackupComponent implements OnInit {
  @Input()
  backups: { [k: string]: BackupDto[] }
  readonly oKeys = Object.keys
  selectedTool: string

  constructor() {}

  ngOnInit() {}

  showTool(toolName: string) {
    this.selectedTool = toolName
  }
}
