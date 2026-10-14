import { defineConfig } from '@playwright/test'
import { join, resolve } from 'node:path'

const root = resolve(__dirname, '../..')
const directory = process.env.WOWIKI_E2E_DIRECTORY
if (!directory) throw new Error('Use npm run test:e2e to prepare isolated test databases and services.')
const serviceEnvironment = { ASPNETCORE_ENVIRONMENT: 'Development', DOTNET_ENVIRONMENT: 'Development' }

export default defineConfig({
  testDir: '.',
  outputDir: join(root, 'test-results'),
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:18080',
    browserName: 'chromium',
    viewport: { width: 1440, height: 1000 },
    timezoneId: 'Europe/Istanbul',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      name: 'Auth',
      command: 'dotnet WoWiki.Auth.Api.dll --urls http://localhost:15100',
      cwd: join(directory, 'auth'),
      url: 'http://localhost:15100/health',
      env: { ...serviceEnvironment, ConnectionStrings__AuthDatabase: `Data Source=${join(directory, 'auth.db')};Foreign Keys=True`, RateLimiting__AuthAttempts__PermitLimit: '100' },
    },
    {
      name: 'Backend',
      command: 'node dist/main.js',
      cwd: join(root, 'backend'),
      url: 'http://127.0.0.1:15000/api/health',
      env: { BACKEND_PORT: '15000', BACKEND_DATABASE_PATH: join(directory, 'backend.db'), AUTH_SERVICE_URL: 'http://localhost:15100' },
    },
    {
      name: 'Frontend',
      command: 'npm run dev -- --port 13000 --host 127.0.0.1',
      cwd: join(root, 'frontend'),
      url: 'http://127.0.0.1:13000',
    },
    {
      name: 'Gateway',
      command: 'dotnet WoWiki.Gateway.dll --urls http://localhost:18080',
      cwd: join(directory, 'gateway'),
      url: 'http://localhost:18080/gateway/health',
      env: {
        ...serviceEnvironment,
        ReverseProxy__Clusters__auth__Destinations__development__Address: 'http://localhost:15100/',
        ReverseProxy__Clusters__backend__Destinations__development__Address: 'http://127.0.0.1:15000/',
        ReverseProxy__Clusters__frontend__Destinations__development__Address: 'http://127.0.0.1:13000/',
      },
    },
  ],
})
