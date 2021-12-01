import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: true,
  apiPath: 'https://lyop.de/api/',
  sshBase: 'omnikron@lyop.de',
  storage: '/usr/src/data/',
  backups: [
    {
      toolName: 'Overleaf',
      archiveName: 'overleaf.tar.gz',
      basePath: '/home/dave/deployment',
      folderName: 'overleaf',
      cron: '0 0 4 * * 0,2,4,6', // Every second weekday at 04:00 am
      img: 'overleaf.svg',
      commands: {
        start: 'cd /home/dave/deployment/overleaf && docker-compose up -d',
        stop: 'cd /home/dave/deployment/overleaf && docker-compose down',
      },
    },
    {
      toolName: 'Nextcloud',
      archiveName: 'nextcloud.tar.gz',
      basePath: '/home/dave/deployment',
      folderName: 'nextcloud',
      cron: '0 0 4 * * *', // Every weekday at 05:00 am
      img: 'nextcloud.svg',
      commands: {
        start: 'cd /home/dave/deployment/nextcloud && docker-compose up -d',
        stop: 'cd /home/dave/deployment/nextcloud && docker-compose down',
      },
    },
    {
      archiveName: 'send.tar.gz',
      basePath: '/home/dave/deployment',
      folderName: 'send',
      cron: '0 0 4 * * 1,3,5', // Every second weekday at 04:00 am
      img: 'send.svg',
      toolName: 'Send',
      commands: {
        start: 'cd /home/dave/deployment/send && docker-compose up -d',
        stop: 'cd /home/dave/deployment/send && docker-compose down',
      },
    },
    {
      archiveName: 'bitwarden.tar.gz',
      basePath: '/opt',
      folderName: 'bitwarden',
      cron: '30 0-23/1 * * *', // Every hour at 30 minutes
      img: 'bitwarden.svg',
      toolName: 'BitWarden',
    },
  ],
}
