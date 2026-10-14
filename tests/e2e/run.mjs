import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cache = join(root, '.cache')
mkdirSync(cache, { recursive: true })
const dataDirectory = mkdtempSync(join(cache, 'e2e-'))
const env = { ...process.env, WOWIKI_E2E_DIRECTORY: dataDirectory }

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit', windowsHide: true })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`)
}

try {
  copyFileSync(join(root, 'backend/Data/demo/wowiki-demo.db'), join(dataDirectory, 'backend.db'))
  run(process.execPath, [process.env.npm_execpath, '--prefix', 'backend', 'run', 'build'])
  for (const [service, project] of [['auth', 'WoWiki.Auth.Api'], ['gateway', 'WoWiki.Gateway']]) {
    run('dotnet', ['build', `services/${service}/src/${project}`, '--output', join(dataDirectory, service), '--nologo'])
  }
  run(process.execPath, [join(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config', join(root, 'tests/e2e/playwright.config.ts'), ...process.argv.slice(2)])
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  rmSync(dataDirectory, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
}
