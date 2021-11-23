import { Component, Input, OnInit } from '@angular/core'
import { AccountCreation, ToolDto, ToolStatus } from '@dashy/api-interfaces'

@Component({
  selector: 'dashy-tool-card',
  templateUrl: './tool-card.component.html',
  styleUrls: ['./tool-card.component.scss'],
})
export class ToolCardComponent {
  @Input() tool: ToolDto
  readonly STATUS = ToolStatus
  readonly CREATION = AccountCreation
}
