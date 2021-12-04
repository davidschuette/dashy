import { AccountCreation } from '@dashy/api-interfaces'
import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: true,
  storage: {
    backups: 'backups.json',
    tools: 'tools.json',
  },
  initTools: [],
}
