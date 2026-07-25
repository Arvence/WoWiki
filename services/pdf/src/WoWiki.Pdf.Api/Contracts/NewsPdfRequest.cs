namespace WoWiki.Pdf.Api.Contracts;

public sealed record NewsPdfRequest(
    string Title,
    string Summary,
    string Content,
    string Category,
    string Author,
    DateTimeOffset UpdatedAt);
