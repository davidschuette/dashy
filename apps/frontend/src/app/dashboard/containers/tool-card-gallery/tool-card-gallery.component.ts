import { Component } from '@angular/core'
import { Tool } from '../../../models/tool'
import { ToolStatus } from '../../../models/tool-status'

@Component({
  selector: 'dashy-tool-card-gallery',
  templateUrl: './tool-card-gallery.component.html',
  styleUrls: ['./tool-card-gallery.component.scss'],
})
export class ToolCardGalleryComponent {
  tools: Tool[] = [
    {
      name: 'overleaf',
      status: ToolStatus.ONLINE,
      description: 'secsascas',
      url: 'https://overleaf.lyop.de',
      img: 'overleaf.svg',
    },
    {
      name: 'overleaf',
      status: ToolStatus.MAINTENANCE,
      description: 'secsascas',
      url: 'https://overleaf.lyop.de',
      img: 'overleaf.svg',
    },
    {
      name: 'overleaf',
      status: ToolStatus.OFFLINE,
      description: 'secsascas',
      url: 'https://overleaf.lyop.de',
      img: 'overleaf.svg',
    },
  ]
}
