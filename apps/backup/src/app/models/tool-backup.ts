export class ToolBackup {
  toolId: string
  folderName: string
  archiveName: string
  basePath: string
  cron: string
  maxNumberOfVersions: number
  commands?: {
    start: string
    stop: string
  }
}
