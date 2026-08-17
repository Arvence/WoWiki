import { copyFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { verifyDemoDatabase } from './demo-database.verifier'

type DatabaseCommand = 'clear' | 'demo'

const backendRoot = resolve(__dirname, '../../..')
const demoDatabasePath = resolveDemoDatabasePath()

function main(): void {
  const command = process.argv[2] as DatabaseCommand | undefined

  switch (command) {
    case 'clear':
      clearDatabase()
      return
    case 'demo':
      installDemoDatabase()
      return
    default:
      throw new Error('Expected a database command: clear or demo')
  }
}

function clearDatabase(): void {
  const activeDatabasePath = resolveActiveDatabasePath()
  ensureDemoTemplateIsProtected(activeDatabasePath)

  const existingFiles = databaseFiles(activeDatabasePath).filter((path) => existsSync(path))
  for (const path of existingFiles) unlinkSync(path)

  if (existingFiles.length === 0) {
    console.log(`No active database files found at ${activeDatabasePath}`)
    return
  }

  console.log(`Cleared ${existingFiles.length} active database file(s) for ${activeDatabasePath}`)
}

function installDemoDatabase(): void {
  const activeDatabasePath = resolveActiveDatabasePath()
  const temporaryDatabasePath = `${activeDatabasePath}.installing-${process.pid}`
  const previousDatabasePath = `${activeDatabasePath}.replacing-${process.pid}`

  ensureDemoTemplateIsProtected(activeDatabasePath)
  verifyDemoDatabase(demoDatabasePath)
  mkdirSync(dirname(activeDatabasePath), { recursive: true })
  copyFileSync(demoDatabasePath, temporaryDatabasePath)

  try {
    for (const path of databaseFiles(activeDatabasePath).slice(1)) {
      if (existsSync(path)) unlinkSync(path)
    }

    if (existsSync(activeDatabasePath)) renameSync(activeDatabasePath, previousDatabasePath)
    renameSync(temporaryDatabasePath, activeDatabasePath)
    if (existsSync(previousDatabasePath)) unlinkSync(previousDatabasePath)
  } catch (error) {
    if (!existsSync(activeDatabasePath) && existsSync(previousDatabasePath)) renameSync(previousDatabasePath, activeDatabasePath)
    if (existsSync(temporaryDatabasePath)) unlinkSync(temporaryDatabasePath)
    throw error
  }

  console.log(`Installed demo data at ${activeDatabasePath}`)
}

function resolveDemoDatabasePath(): string {
  const configuredPath = process.env.BACKEND_DEMO_DATABASE_PATH?.trim()
  if (!configuredPath) return resolve(backendRoot, 'Data/demo/wowiki-demo.db')
  return isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath)
}

function resolveActiveDatabasePath(): string {
  const configuredPath = process.env.BACKEND_DATABASE_PATH?.trim()
  if (!configuredPath) return resolve(backendRoot, 'Data/wowiki-backend.db')
  return isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath)
}

function databaseFiles(databasePath: string): string[] {
  return [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]
}

function ensureDemoTemplateIsProtected(activeDatabasePath: string): void {
  if (!pathsMatch(activeDatabasePath, demoDatabasePath)) return
  throw new Error('Refusing to modify the committed demo database template. Choose a different BACKEND_DATABASE_PATH.')
}

function pathsMatch(left: string, right: string): boolean {
  const leftPath = resolve(left)
  const rightPath = resolve(right)
  return process.platform === 'win32' ? leftPath.toLowerCase() === rightPath.toLowerCase() : leftPath === rightPath
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
