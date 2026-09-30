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
    var errors = new Dictionary<string, string[]>();

    if (string.IsNullOrWhiteSpace(article.Title))
    {
        errors[nameof(article.Title)] = ["Title is required."];
    }
    else if (article.Title.Length > 200)
    {
        errors[nameof(article.Title)] = ["Title must not exceed 200 characters."];
    }

    if (article.Summary is null)
    {
        errors[nameof(article.Summary)] = ["Summary must be a string."];
    }
    else if (article.Summary.Length > 5_000)
    {
        errors[nameof(article.Summary)] = ["Summary must not exceed 5000 characters."];
    }

    if (string.IsNullOrWhiteSpace(article.Content))
    {
        errors[nameof(article.Content)] = ["Content is required."];
    }
    else if (article.Content.Length > 50_000)
    {
        errors[nameof(article.Content)] = ["Content must not exceed 50000 characters."];
    }

    if (string.IsNullOrWhiteSpace(article.Category))
    {
        errors[nameof(article.Category)] = ["Category is required."];
    }
    else if (article.Category.Length > 80)
    {
        errors[nameof(article.Category)] = ["Category must not exceed 80 characters."];
    }

    if (string.IsNullOrWhiteSpace(article.Author))
    {
        errors[nameof(article.Author)] = ["Author is required."];
    }
    else if (article.Author.Length > 100)
    {
        errors[nameof(article.Author)] = ["Author must not exceed 100 characters."];
    }

    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var pdf = NewsPdfDocument.Create(article);
    var fileName = $"{FileNames.Sanitize(article.Title)}.pdf";
    return Results.File(pdf, "application/pdf", fileName);
});

app.Run();

public partial class Program;
