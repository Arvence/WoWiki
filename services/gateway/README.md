# WoWiki Gateway

The gateway is WoWiki's only browser-facing entry point. In development it listens at
`http://localhost:8080` and uses YARP to forward requests to the internal services.

## Responsibilities

- Route `/api/auth/*`, `/api/pdf/*`, `/api/*`, `/images/*`, and frontend traffic.
- Apply a coarse fixed-window API limit partitioned by client IP.
- Create and propagate `X-Correlation-ID`.
- Add baseline browser security headers.
- Apply request-size and request/proxy timeouts.
- Trust forwarded client information only from explicitly configured proxies.
- Emit structured JSON request logs.
- Report gateway health without coupling it to downstream availability.

Business logic, service-specific authorization, persistence, response composition, and PDF
generation remain in their owning services.

## Routes

| Public path | Internal destination |
| --- | --- |
| `/` | Frontend on port `3000` |
| `/api/auth/*` | Auth service on port `5100` |
| `/api/pdf/*` | PDF service on port `5200` |
| `/api/*` | NestJS backend on port `5000` |
| `/images/*` | NestJS backend on port `5000` |

`GET /gateway/health` reports whether the gateway process is accepting requests. Downstream
services expose and own their health checks independently, so one unavailable service does not
make unrelated gateway routes unhealthy.

## Run and test

Start the internal services, then:

```powershell
dotnet run --project src/WoWiki.Gateway
```

Run the gateway integration suite:

```powershell
dotnet test tests/WoWiki.Gateway.Tests/WoWiki.Gateway.Tests.csproj
```

The suite verifies route precedence, correlation/security headers, client rate limiting,
gateway health, and unavailable-destination behavior.

## Configuration

ASP.NET Core environment variables override all settings. Common production settings are:

```text
ASPNETCORE_HTTP_PORTS
AllowedHosts
Kestrel__Limits__MaxRequestBodySize
RateLimiting__PermitLimit
RateLimiting__WindowSeconds
Security__RedirectToHttps
Security__UseHsts
ForwardedHeaders__Enabled
ForwardedHeaders__KnownProxies__0
ReverseProxy__Clusters__frontend__Destinations__development__Address
ReverseProxy__Clusters__backend__Destinations__development__Address
ReverseProxy__Clusters__auth__Destinations__development__Address
ReverseProxy__Clusters__pdf__Destinations__development__Address
```

Outside the Development and Testing environments, startup fails if `AllowedHosts` is empty or
contains `*`. If forwarded headers are enabled, at least one exact trusted proxy IP must also be
configured. Only enable HTTPS redirection when TLS terminates at the gateway or trusted forwarded
headers correctly report the original HTTPS scheme.

Rate limiting uses the effective remote IP after trusted forwarded headers are processed.
Authentication endpoints retain their stricter service-owned rate limit as defense in depth.
