import { Tool } from '../app/models/tool.model'

export interface EnvironmentModel {
  production: boolean
  storage: {
    backups: string
    tools: string
  }
  initTools: Tool[]
}
