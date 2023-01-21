export class ToolBackup {
  toolId: string
  folderName: string
  basePath: string
  cron: string
  commands?: {
    start: string
    stop: string
  }
}
