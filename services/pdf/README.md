# WoWiki PDF service

ASP.NET service that renders a WoWiki news article as a downloadable PDF without external PDF dependencies.

```powershell
dotnet run --project src/WoWiki.Pdf.Api
```

The service listens on `http://localhost:5200`. Its endpoints are:

- `GET /health`
- `POST /api/pdf/news`
