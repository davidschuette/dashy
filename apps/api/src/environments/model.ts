import { Tool } from '../app/models/tool.model'

export interface EnvironmentModel {
  readonly production: boolean
  readonly storage: {
    readonly backups: string
    readonly tools: string
  }
  readonly initTools: Tool[]
}
