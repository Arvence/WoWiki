# WoWiki

WoWiki is a modular World of Warcraft Classic platform built with a React frontend, a NestJS content and game-data API, ASP.NET Core services, and a YARP gateway.

## Local architecture

The browser uses one origin: `http://localhost:8080`.

| Public path | Destination |
| --- | --- |
| `/` | React frontend on port `3000` |
| `/api/auth/*` | Auth service on port `5100` |
| `/api/pdf/*` | PDF service on port `5200` |
| `/api/tools/*` | Planned Tools service on port `5300` |
| `/api/*` | NestJS backend on port `5000` |
| `/images/*` | NestJS backend on port `5000` |
| `/gateway/health` | Gateway health check |

The frontend only uses relative application URLs. Internal ports remain implementation details behind the gateway.

## Run locally

Start each component in a separate terminal:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

```powershell
cd services/auth
dotnet run --project src/WoWiki.Auth.Api
```

```powershell
cd services/pdf
dotnet run --project src/WoWiki.Pdf.Api
```

```powershell
cd services/gateway
dotnet run --project src/WoWiki.Gateway
```

Open `http://localhost:8080`.

## Repository structure

```text
frontend/          React user interface
backend/           NestJS content and canonical game-data API
services/auth/     ASP.NET Core identity service
services/pdf/      ASP.NET Core PDF generation service
services/gateway/  YARP public entry point and request routing
services/tools/    Planned ASP.NET Core tools service
```

The gateway is the required browser entry point. Vite serves frontend assets internally and does not proxy application APIs.
