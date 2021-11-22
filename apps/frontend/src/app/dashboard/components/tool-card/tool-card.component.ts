import { Component, Input } from '@angular/core'
import { Tool } from '../../../models/tool'
import { ToolStatus } from '../../../models/tool-status'

@Component({
  selector: 'dashy-tool-card',
  templateUrl: './tool-card.component.html',
  styleUrls: ['./tool-card.component.scss'],
})
export class ToolCardComponent {
  @Input() tool?: Tool
  readonly STATUS = ToolStatus
}
