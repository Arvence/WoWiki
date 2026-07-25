using WoWiki.Pdf.Api.Contracts;
using WoWiki.Pdf.Api.Documents;
using WoWiki.Pdf.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();

var app = builder.Build();

app.Use(async (context, next) =>
{
    const string correlationHeader = "X-Correlation-ID";
    var suppliedCorrelationId = context.Request.Headers[correlationHeader].FirstOrDefault();
    var correlationId = Guid.TryParse(suppliedCorrelationId, out var parsedId)
        ? parsedId.ToString("N")
        : Guid.NewGuid().ToString("N");

    context.TraceIdentifier = correlationId;
    context.Request.Headers[correlationHeader] = correlationId;
    context.Response.OnStarting(() =>
    {
        context.Response.Headers[correlationHeader] = correlationId;
        return Task.CompletedTask;
    });

    await next();
});

app.UseExceptionHandler();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    service = "wowiki-pdf",
    timestampUtc = DateTimeOffset.UtcNow,
}));

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

public partial class Program;
