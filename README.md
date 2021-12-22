# Dashy

Dashy is a monorepo consisting of three different apps ([frontend](#apps-frontend), [api](#apps-api), [backup](#apps-backup)). These apps provide an infrastructure around a server with multiple self-hosted tool subdomains.

## Apps

<!----><a name="apps-frontend"></a>

### Frontend

The frontend app provides a dashboard with an overview of the different tools. Each card includes a small description, a `ONLINE`/`OFFLINE` status and a link to the specific tool.

Additionally, there is a storage bar representing the remaining storage space on the server.

Below that, a list of the most recent backup reports can be found. More on this [here](#apps-backup).

<!----><a name="apps-api"></a>

### API

The API provides required data for the frontend (e.g. list of tools) and gathers backup reports.

<!----><a name="apps-backup"></a>

### Backup

The backup service can be configured with different backup targets. The basic principle is an offsite backup server running this service. Files are downloaded using `rsync` and then compressed to a `.tar.gz` archive. Backups are triggered by a cron expression.
