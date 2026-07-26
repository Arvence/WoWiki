# WoWiki backend

NestJS API for WoWiki content and canonical game data.

## Local database

The backend uses Node's built-in SQLite driver and stores mutable data in
`Data/wowiki-backend.db`. On first startup, database migrations run and the
existing seed datasets initialize empty collections. Later startups preserve
created, updated, and deleted records.

Override the local database path when needed:

```powershell
$env:BACKEND_DATABASE_PATH = "C:\data\wowiki-backend.db"
npm run dev
```

Database files and their WAL sidecars are ignored by Git.

## Run and test

```powershell
npm run dev
npm test
```
