import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: false,
  apiPath: 'http://localhost:3333/api/',
  apiAuthenticationKey: 'local',
  sshBase: 'root@lyop.de',
  storage: './deployment/backup_data/',
  backups: [
    {
      archiveName: 'Overleaf',
      basePath: '/home/dave/deployment/',
      folderName: 'overleaf2',
      cron: '30 0-23/1 * * *', // Every hour at 30 minutes
      toolId: '068e36b4-929b-49a2-ae3c-01fd69538b49',
      maxNumberOfVersions: 2,
      commands: {
        start: 'cd /home/dave/deployment/overleaf2 && bin/up -d',
        stop: 'cd /home/dave/deployment/overleaf2 && bin/docker-compose down',
      },
    },
    {
      archiveName: 'BitWarden',
      basePath: '/opt/',
      folderName: 'bitwarden',
      cron: '30 0-23/1 * * *', // Every hour at 30 minutes
      toolId: '25396289-e7b0-4593-aff9-6612c271e9a3',
      maxNumberOfVersions: 2,
    },
  ],
}
