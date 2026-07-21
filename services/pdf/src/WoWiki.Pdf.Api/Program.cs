using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

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

public sealed record NewsPdfRequest(
    string Title,
    string Summary,
    string Content,
    string Category,
    string Author,
    DateTimeOffset UpdatedAt);

internal static class FileNames
{
    public static string Sanitize(string value)
    {
        var cleaned = Regex.Replace(value.Trim(), "[^a-zA-Z0-9_-]+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(cleaned) ? "wowiki-news" : cleaned[..Math.Min(cleaned.Length, 80)];
    }
}

internal static class NewsPdfDocument
{
    private const int PageWidth = 612;
    private const int PageHeight = 792;
    private const int Margin = 54;
    private const int BottomMargin = 54;

    public static byte[] Create(NewsPdfRequest article)
    {
        var sections = new List<TextBlock>
        {
            new(article.Category.ToUpperInvariant(), 10, 14),
            new(article.Title, 22, 30),
            new($"By {article.Author}  |  Updated {article.UpdatedAt.ToString("MMMM d, yyyy", CultureInfo.InvariantCulture)}", 10, 22),
            new(article.Summary, 14, 24),
            new(article.Content, 11, 18)
        };

        var pages = Layout(sections);
        return BuildPdf(pages, article.Title);
    }

    private static List<List<DrawLine>> Layout(IEnumerable<TextBlock> blocks)
    {
        var pages = new List<List<DrawLine>> { new() };
        var y = PageHeight - Margin;

        foreach (var block in blocks)
        {
            foreach (var line in Wrap(block.Text, block.FontSize))
            {
                if (y - block.LineHeight < BottomMargin)
                {
                    pages.Add(new());
                    y = PageHeight - Margin;
                }

                pages[^1].Add(new DrawLine(line, Margin, y, block.FontSize));
                y -= block.LineHeight;
            }

            y -= 8;
        }

        return pages;
    }

    private static IEnumerable<string> Wrap(string text, int fontSize)
    {
        var maxCharacters = Math.Max(20, (int)((PageWidth - (Margin * 2)) / (fontSize * 0.52)));
        foreach (var paragraph in text.Replace("\r", "").Split('\n'))
        {
            var words = Regex.Split(paragraph.Trim(), "\\s+").Where(word => word.Length > 0);
            var line = new StringBuilder();

            foreach (var word in words)
            {
                if (line.Length > 0 && line.Length + word.Length + 1 > maxCharacters)
                {
                    yield return line.ToString();
                    line.Clear();
                }

                if (line.Length > 0) line.Append(' ');
                line.Append(word);
            }

            if (line.Length > 0) yield return line.ToString();
            if (string.IsNullOrWhiteSpace(paragraph)) yield return string.Empty;
        }
    }

    private static byte[] BuildPdf(IReadOnlyList<List<DrawLine>> pages, string title)
    {
        var objects = new List<string>();
        var pageObjectNumbers = Enumerable.Range(0, pages.Count).Select(index => 4 + (index * 2)).ToArray();
        var kids = string.Join(' ', pageObjectNumbers.Select(number => $"{number} 0 R"));

        objects.Add("<< /Type /Catalog /Pages 2 0 R >>");
        objects.Add($"<< /Type /Pages /Kids [{kids}] /Count {pages.Count} >>");
        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

        for (var index = 0; index < pages.Count; index++)
        {
            var contentObjectNumber = pageObjectNumbers[index] + 1;
            objects.Add($"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PageWidth} {PageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents {contentObjectNumber} 0 R >>");
            var stream = RenderPage(pages[index]);
            objects.Add($"<< /Length {Encoding.ASCII.GetByteCount(stream)} >>\nstream\n{stream}\nendstream");
        }

        var output = new MemoryStream();
        Write(output, "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
        var offsets = new List<long> { 0 };

        for (var index = 0; index < objects.Count; index++)
        {
            offsets.Add(output.Position);
            Write(output, $"{index + 1} 0 obj\n{objects[index]}\nendobj\n");
        }

        var xref = output.Position;
        Write(output, $"xref\n0 {objects.Count + 1}\n0000000000 65535 f \n");
        foreach (var offset in offsets.Skip(1)) Write(output, $"{offset:0000000000} 00000 n \n");
        Write(output, $"trailer\n<< /Size {objects.Count + 1} /Root 1 0 R /Info << /Title ({Escape(title)}) >> >>\nstartxref\n{xref}\n%%EOF");
        return output.ToArray();
    }

    private static string RenderPage(IEnumerable<DrawLine> lines)
    {
        var content = new StringBuilder("BT\n");
        foreach (var line in lines)
        {
            content.Append(CultureInfo.InvariantCulture, $"/F1 {line.FontSize} Tf\n1 0 0 1 {line.X} {line.Y} Tm\n({Escape(line.Text)}) Tj\n");
        }
        return content.Append("ET").ToString();
    }

    private static string Escape(string value)
    {
        var normalized = value.Normalize(NormalizationForm.FormD);
        var ascii = new string(normalized.Where(character =>
            CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark && character <= 127).ToArray());
        return ascii.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
    }

    private static void Write(Stream stream, string value) => stream.Write(Encoding.ASCII.GetBytes(value));

    private sealed record TextBlock(string Text, int FontSize, int LineHeight);
    private sealed record DrawLine(string Text, int X, int Y, int FontSize);
}
