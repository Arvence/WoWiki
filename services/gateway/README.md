# WoWiki Gateway

The development gateway provides one browser-facing origin at `http://localhost:8080`.

It forwards:

- `/` to the Vite frontend on port `3000`
- `/api/auth/*` to the Auth service on port `5100`
- `/api/pdf/*` to the PDF service on port `5200`
- `/api/tools/*` to the planned Tools service on port `5300`
- `/api/*` and `/images/*` to the NestJS backend on port `5000`

Run the existing services first, then start the gateway:

```powershell
dotnet run --project src/WoWiki.Gateway
```

Open `http://localhost:8080`. Vite serves frontend assets internally; all application API traffic goes through the gateway.
The Tools route is reserved now and will return `502 Bad Gateway` until that service is created.
