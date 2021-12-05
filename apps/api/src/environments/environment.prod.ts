import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: true,
  apiKey: '',
  storage: {
    backups: 'backups.json',
    tools: 'tools.json',
  },
  initTools: [],
  prometheusHost: 'prometheus:9090',
}
