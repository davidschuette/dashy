import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: false,
  apiPath: 'http://localhost:3333/api/',
  apiAuthenticationKey: 'local',
  sshBase: '',
  storage: './data/',
  backups: [
    {
      archiveName: 'overleaf.tar.gz',
      basePath: '/home/dave/deployment',
      folderName: 'overleaf',
      cron: '* 0 4 * * 0,2,4,6',
      img: 'overleaf.svg',
      toolName: 'Overleaf',
      commands: {
        start: 'cd /home/dave/deployment/overleaf && docker-compose up -d',
        stop: 'cd /home/dave/deployment/overleaf && docker-compose down',
      },
    },
    {
      archiveName: 'overleaf.tar.gz',
      basePath: '/home/dave/deployment',
      folderName: 'overleaf',
      cron: CronExpression.EVERY_10_SECONDS,
      img: 'overleaf.svg',
      toolName: 'Overleaf 2',
      commands: {
        start: 'cd /home/dave/deployment/overleaf && docker-compose up -d',
        stop: 'cd /home/dave/deployment/overleaf && docker-compose down',
      },
    },
  ],
}
