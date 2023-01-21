import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: true,
  apiKey: 'local',
  storage: 'data.db',
  initTools: [],
  prometheusHost: 'prometheus:9090',
  backups: [],
  sshBase: '',
  restic: {
    repository: '',
    password: '',
  },
}
