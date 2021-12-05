import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: false,
  apiKey: 'local',
  storage: {
    backups: './deployment/api_data/backups.json',
    tools: './deployment/api_data/tools.json',
  },
  initTools: [],
  prometheusHost: 'localhost:9090',
}
