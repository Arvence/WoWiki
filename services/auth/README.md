# WoWiki Auth Service

ASP.NET Core Identity service for WoWiki. Development uses a local SQLite file, so no database server or Docker setup is required.

## Requirements

- .NET 10 SDK

## Run locally

```powershell
dotnet run --project src/WoWiki.Auth.Api
```

The API listens at `http://localhost:5100`. On first startup, EF Core applies migrations, creates `Data/wowiki-auth.db`, and seeds the `user`, `moderator`, and `admin` roles.

## Endpoints

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Service and database health |
| `POST` | `/api/auth/register` | Public | Create an account and session |
| `POST` | `/api/auth/login` | Public | Create a cookie session |
| `POST` | `/api/auth/logout` | Required | End the current session |
| `GET` | `/api/auth/me` | Required | Return the current user |
| `PATCH` | `/api/auth/me` | Required | Update display name and email |
| `POST` | `/api/auth/change-password` | Required | Change the current password |

Register and login return an HTTP-only `wowiki.auth` cookie. Browser requests must use credentials (`credentials: 'include'`). The development CORS policy permits the frontend ports `3000` and `5173`.

## Configuration

Settings live in `src/WoWiki.Auth.Api/appsettings.json`. Override secrets and deployment-specific values with environment variables rather than committing them.

Cookie encryption keys are persisted in the ignored `DataProtection-Keys` directory so local sessions survive restarts. In production, mount this path from a protected persistent secret volume and terminate traffic over HTTPS.

The next integration step is standards-based access-token issuance for the NestJS API. Cookie authentication is intentionally implemented first so local account flows can be built and tested safely without storing credentials or tokens in browser storage.
