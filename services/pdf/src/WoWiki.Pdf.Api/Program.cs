using WoWiki.Pdf.Api.Contracts;
using WoWiki.Pdf.Api.Documents;
using WoWiki.Pdf.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5200");

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapPost("/api/pdf/news", (NewsPdfRequest article) =>
{
    if (string.IsNullOrWhiteSpace(article.Title) ||
        string.IsNullOrWhiteSpace(article.Content) ||
        string.IsNullOrWhiteSpace(article.Author))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["article"] = ["Title, author, and content are required."]
        });
    }

    var pdf = NewsPdfDocument.Create(article);
    var fileName = $"{FileNames.Sanitize(article.Title)}.pdf";
    return Results.File(pdf, "application/pdf", fileName);
});

app.Run();
