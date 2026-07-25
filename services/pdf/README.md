# WoWiki PDF service

ASP.NET service that renders a WoWiki news article as a downloadable PDF without external PDF dependencies.

```powershell
dotnet run --project src/WoWiki.Pdf.Api
```

The service listens on `http://localhost:5200`. Its endpoints are:

- `GET /health`
- `POST /api/pdf/news`

Browser traffic reaches the PDF service through the gateway at `/api/pdf/*`. The service adopts
the gateway correlation ID, emits Problem Details for failures, and returns successful documents
as `application/pdf` downloads. Override `Urls` with `ASPNETCORE_URLS` when deploying.
