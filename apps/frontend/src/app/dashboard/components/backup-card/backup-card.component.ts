import { Component, Input, OnInit } from '@angular/core'
import { BackupDto } from '@dashy/api-interfaces'

@Component({
  selector: 'dashy-backup-card',
  templateUrl: './backup-card.component.html',
  styleUrls: ['./backup-card.component.scss'],
})
export class BackupCardComponent implements OnInit {
  @Input() backup: BackupDto

  constructor() {}

  ngOnInit(): void {}
}
