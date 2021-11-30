export class ToolBackup {
  toolName: string
  img: string
  folderName: string
  archiveName: string
  basePath: string
  cron: string
  commands?: {
    start: string
    stop: string
  }
}