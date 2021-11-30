import { ToolBackup } from '../app/models/tool-backup'

export interface EnvironmentModel {
  readonly production: boolean
  readonly apiPath: string
  readonly backups: ToolBackup[]
  readonly sshBase: string
}
