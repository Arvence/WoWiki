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

Register and login return an HTTP-only `wowiki.auth` cookie. Browser requests go through the
gateway and use credentials (`credentials: 'include'`). The Auth service does not require a
browser CORS policy because it is not a public browser origin.

## Configuration

Settings live in `src/WoWiki.Auth.Api/appsettings.json`. Override secrets and deployment-specific values with environment variables rather than committing them.

Cookie encryption keys are persisted in the ignored `DataProtection-Keys` directory so local sessions survive restarts. In production, mount this path from a protected persistent secret volume and terminate traffic over HTTPS.

The gateway forwards the effective client address, and Auth trusts forwarded headers only from
configured proxy addresses. This keeps the login/register limiter partitioned per browser rather
than per gateway process. Configure production proxies with
`ForwardedHeaders__KnownProxies__0` and adjust the limiter with
`RateLimiting__AuthAttempts__PermitLimit` and
`RateLimiting__AuthAttempts__WindowSeconds`.

The NestJS API validates protected requests against `/api/auth/me`, forwarding the session cookie
and correlation ID with a short timeout.
