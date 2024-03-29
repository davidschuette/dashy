import { AccountCreation } from '@dashy/api-interfaces'
import { EnvironmentModel } from './model'

export const environment: EnvironmentModel = {
  production: false,
  apiKey: 'local',
  storage: './deployment/api_data/data.db',
  initTools: [
    {
      id: '068e36b4-929b-49a2-ae3c-01fd69538b49',
      name: 'Overleaf',
      description:
        'Overleaf ist ein online LaTeX Kollaborationstool. Es ist keine Installation erforderlich. Zudem gibt es einen vollständigen Änderungsverlauf.',
      url: 'https://overleaf.lyop.de',
      img: 'overleaf.svg',
      containerNames: `["sharelatex", "redis", "mongo"]`,
      accountCreation: AccountCreation.ON_REQUEST,
      isInMaintenance: false,
    },
    {
      id: '',
      name: 'Nextcloud',
      description:
        'Nextcloud ist eine Software für das Speichern von Daten (Filehosting).\nBei Einsatz eines Clients wird der Server automatisch mit einem lokalen Verzeichnis synchronisiert. Dadurch kann von mehreren Rechnern, aber auch über eine Weboberfläche, auf einen konsistenten Datenbestand zugegriffen werden.\nEbenfalls sind Videokonferenzen und das „Teilen“ des eigenen Bildschirms möglich. Alle Daten auf der Nextcloud sind End-to-End verschlüsselt. Mit Nextcloud behält der Besitzer die vollständige Kontrolle über seine Daten, und Möglichkeiten für Datenmissbrauch werden reduziert.',
      url: 'https://next.lyop.de',
      img: 'nextcloud.svg',
      containerNames: `["nextcloud_app_1", "nextcloud_db_1"]`,
      accountCreation: AccountCreation.ON_REQUEST,
      isInMaintenance: false,
    },
    {
      id: '',
      name: 'Send',
      description:
        'Mit Send kannst du Dateien sicher mit anderen teilen – mit End-to-End-Verschlüsselung und einem Freigabe-Link, der automatisch abläuft.\nSo bleiben deine geteilten Inhalte privat und du kannst sicherstellen, dass deine Daten nicht für immer im Web herumschwirren.',
      url: 'https://send.lyop.de',
      img: 'send.svg',
      containerNames: `["send_send_1", "send_redis_1"]`,
      accountCreation: AccountCreation.NO_ACCOUNT,
      isInMaintenance: false,
    },
    {
      id: '25396289-e7b0-4593-aff9-6612c271e9a3',
      name: 'BitWarden',
      description:
        'BitWarden ist ein online Password-Manager. Es gibt Clients für alle gängien Geräte. Alle Passwörter werden zwischen den Geräten synchronisiert.',
      url: 'https://bitwarden.lyop.de',
      img: 'bitwarden.svg',
      containerNames: `["bitwarden-nginx","bitwarden-admin","bitwarden-portal","bitwarden-attachments","bitwarden-web","bitwarden-mssql","bitwarden-sso","bitwarden-events","bitwarden-identity","bitwarden-icons","bitwarden-api","bitwarden-notifications"]`,
      accountCreation: AccountCreation.SELF,
      isInMaintenance: false,
    },
    {
      id: '',
      name: 'Plex',
      description: 'Filme und Serien, die es sonst nirgends gibt.',
      url: 'https://plex.lyop.de',
      img: 'plex.png',
      containerNames: `[]`,
      accountCreation: AccountCreation.ON_REQUEST,
      isInMaintenance: false,
    },
    { id: 'test', name: 'Test', description: '', url: '', img: '', containerNames: `[]`, accountCreation: AccountCreation.LOCKED, isInMaintenance: false },
  ],
  backups: [
    {
      basePath: '/home/dave/deployment/',
      folderName: 'overleaf2',
      cron: '30 0-23/1 * * *', // Every hour at 30 minutes
      toolId: '068e36b4-929b-49a2-ae3c-01fd69538b49',
      commands: {
        start: 'cd /home/dave/deployment/overleaf2 && bin/up -d',
        stop: 'cd /home/dave/deployment/overleaf2 && bin/docker-compose down',
      },
    },
    {
      basePath: '/opt/',
      folderName: 'bitwarden',
      cron: '30 0-23/1 * * *', // Every hour at 30 minutes
      toolId: '25396289-e7b0-4593-aff9-6612c271e9a3',
    },
    { basePath: '/Users/dave/', folderName: 'new_migration', cron: '30 0-23/1 * * *', toolId: 'test' },
  ],
  sshBase: 'root@lyop.de',
  prometheusHost: 'localhost:9090',
  restic: {
    repository: 'sftp:u332514@u332514.your-storagebox.de:/data/test',
    password: 'dave',
  },
}
