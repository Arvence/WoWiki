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

## Archived demo database

The first-run experience uses the built-in seeds. The versioned
`Data/demo/wowiki-demo.db` is an optional archive with 27 sourced WoW Classic
records. To load it, stop the backend and back up the active database first.
This command replaces the selected local backend database:

```powershell
npm run db:demo
npm run dev
```

The archive has no item, character, or community entries. The committed
template remains unchanged when you install it.

To delete the active local database, stop the backend and back it up, then run:

```powershell
npm run db:clear
```

The next backend startup creates a fresh database and initializes the built-in
seed datasets. Run `npm run db:demo` again to restore the demo dataset.

Both commands honor `BACKEND_DATABASE_PATH`. A relative override is resolved
from the directory where the command is run.

## Run and test

```powershell
npm run dev
npm test
```
