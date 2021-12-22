import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: false,
  apiPath: 'http://localhost:3333/api/',
  apiAuthenticationKey: 'local',
  sshBase: '',
  storage: './deployment/backup_data/',
  backups: [
    {
      archiveName: 'dashy',
      basePath: 'deployment/',
      folderName: 'dashy',
      cron: '30 0-23/1 * * *', // Every hour at 30 minutes
      img: 'dashy.svg',
      toolName: 'Dashy',
      maxNumberOfVersions: 2,
    },
  ],
}
