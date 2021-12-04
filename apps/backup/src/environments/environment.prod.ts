import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: true,
  apiPath: '',
  sshBase: '',
  // Should stay fixed for docker container usage
  storage: '/usr/src/data/',
  backups: [],
}
