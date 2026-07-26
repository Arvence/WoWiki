using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using WoWiki.Pdf.Api.Contracts;

namespace WoWiki.Pdf.Api.Documents;

internal static class NewsPdfDocument
{
    private const int PageWidth = 612;
    private const int PageHeight = 792;
    private const int Margin = 54;
    private const int ContentWidth = PageWidth - (Margin * 2);
    private const int ContentBottom = 70;
    private const int BodyTop = 692;

    private const string RegularFont = "F1";
    private const string BoldFont = "F2";
    private const string ItalicFont = "F3";

    private static readonly PdfColor Ink = new(0.12, 0.09, 0.06);
    private static readonly PdfColor MutedInk = new(0.38, 0.33, 0.25);
    private static readonly PdfColor Gold = new(0.78, 0.61, 0.23);
    private static readonly PdfColor HeaderBackground = new(0.086, 0.071, 0.051);
    private static readonly PdfColor HeaderText = new(0.95, 0.91, 0.82);
    private static readonly PdfColor SummaryBackground = new(0.96, 0.94, 0.88);
    private static readonly PdfColor Rule = new(0.82, 0.76, 0.65);

    public static byte[] Create(NewsPdfRequest article)
    {
        var pages = new List<PdfPage>();
        var page = AddPage(pages);
        var y = (double)BodyTop;

        AddWrappedText(
            pages,
            ref page,
            ref y,
            article.Category.ToUpperInvariant(),
            Margin,
            ContentWidth,
            9,
            14,
            BoldFont,
            Gold,
            8);
        AddWrappedText(
            pages,
            ref page,
            ref y,
            article.Title,
            Margin,
            ContentWidth,
            25,
            30,
            BoldFont,
            Ink,
            10);

        var updated = article.UpdatedAt.ToString("MMMM d, yyyy", CultureInfo.InvariantCulture);
        AddWrappedText(
            pages,
            ref page,
            ref y,
            $"By {article.Author}  /  Updated {updated}",
            Margin,
            ContentWidth,
            10,
            15,
            ItalicFont,
            MutedInk,
            18);

        page.Rectangles.Add(new DrawRectangle(Margin, y, ContentWidth, 1, Gold));
        y -= 25;

        AddSummary(pages, ref page, ref y, article.Summary);
        AddBody(pages, ref page, ref y, article.Content);

        return BuildPdf(pages, article.Title, article.Author);
    }

    private static PdfPage AddPage(ICollection<PdfPage> pages)
    {
        var page = new PdfPage();
        page.Rectangles.Add(new DrawRectangle(0, PageHeight - 64, PageWidth, 64, HeaderBackground));
        page.Rectangles.Add(new DrawRectangle(0, PageHeight - 68, PageWidth, 4, Gold));
        page.Text.Add(new DrawText("WoWiki", Margin, PageHeight - 38, 18, BoldFont, Gold));
        page.Text.Add(new DrawText(
            "WORLD OF WARCRAFT CLASSIC  /  NEWS ARCHIVE",
            Margin,
            PageHeight - 53,
            7,
            RegularFont,
            HeaderText));

        if (pages.Count > 0)
        {
            page.Text.Add(new DrawText("CONTINUED", PageWidth - Margin - 52, PageHeight - 44, 7, BoldFont, HeaderText));
        }

        pages.Add(page);
        return page;
    }

    private static void AddSummary(
        ICollection<PdfPage> pages,
        ref PdfPage page,
        ref double y,
        string summary)
    {
        if (string.IsNullOrWhiteSpace(summary))
        {
            return;
        }

        var lines = Wrap(summary, 12, ContentWidth - 36).ToList();
        var lineIndex = 0;
        while (lineIndex < lines.Count)
        {
            var availableLines = Math.Max(0, (int)Math.Floor((y - ContentBottom - 28) / 18));
            if (availableLines == 0)
            {
                page = AddPage(pages);
                y = BodyTop;
                continue;
            }

            var lineCount = Math.Min(availableLines, lines.Count - lineIndex);
            var boxHeight = 28 + (lineCount * 18);
            var boxBottom = y - boxHeight;
            page.Rectangles.Add(new DrawRectangle(Margin, boxBottom, ContentWidth, boxHeight, SummaryBackground));
            page.Rectangles.Add(new DrawRectangle(Margin, boxBottom, 4, boxHeight, Gold));

            var textY = y - 24;
            for (var index = 0; index < lineCount; index++)
            {
                page.Text.Add(new DrawText(lines[lineIndex + index], Margin + 18, textY, 12, BoldFont, Ink));
                textY -= 18;
            }

            lineIndex += lineCount;
            y = boxBottom - 22;

            if (lineIndex < lines.Count)
            {
                page = AddPage(pages);
                y = BodyTop;
            }
        }
    }

    private static void AddBody(
        ICollection<PdfPage> pages,
        ref PdfPage page,
        ref double y,
        string content)
    {
        foreach (var paragraph in content.Replace("\r", "").Split('\n'))
        {
            if (string.IsNullOrWhiteSpace(paragraph))
            {
                y -= 9;
                continue;
            }

            foreach (var line in Wrap(paragraph, 11, ContentWidth))
            {
                EnsureSpace(pages, ref page, ref y, 17);
                page.Text.Add(new DrawText(line, Margin, y, 11, RegularFont, Ink));
                y -= 17;
            }

            y -= 7;
        }
    }

    private static void AddWrappedText(
        ICollection<PdfPage> pages,
        ref PdfPage page,
        ref double y,
        string text,
        double x,
        double width,
        int fontSize,
        int lineHeight,
        string font,
        PdfColor color,
        int after)
    {
        foreach (var line in Wrap(text, fontSize, width))
        {
            EnsureSpace(pages, ref page, ref y, lineHeight);
            page.Text.Add(new DrawText(line, x, y, fontSize, font, color));
            y -= lineHeight;
        }

        y -= after;
    }

    private static void EnsureSpace(
        ICollection<PdfPage> pages,
        ref PdfPage page,
        ref double y,
        int lineHeight)
    {
        if (y - lineHeight >= ContentBottom)
        {
            return;
        }

        page = AddPage(pages);
        y = BodyTop;
    }

    private static IEnumerable<string> Wrap(string text, int fontSize, double width)
    {
        var words = Regex.Split(text.Trim(), "\\s+").Where(word => word.Length > 0);
        var line = new StringBuilder();

        foreach (var word in words)
        {
            if (MeasureText(word, fontSize) > width)
            {
                if (line.Length > 0)
                {
                    yield return line.ToString();
                    line.Clear();
                }

                foreach (var chunk in BreakWord(word, fontSize, width))
                {
                    yield return chunk;
                }

                continue;
            }

            if (line.Length > 0 && MeasureText($"{line} {word}", fontSize) > width)
            {
                yield return line.ToString();
                line.Clear();
            }

            if (line.Length > 0)
            {
                line.Append(' ');
            }

            line.Append(word);
        }

        if (line.Length > 0)
        {
            yield return line.ToString();
        }
    }

    private static IEnumerable<string> BreakWord(string word, int fontSize, double width)
    {
        var chunk = new StringBuilder();
        foreach (var character in word)
        {
            if (chunk.Length > 0 && MeasureText($"{chunk}{character}", fontSize) > width)
            {
                yield return chunk.ToString();
                chunk.Clear();
            }

            chunk.Append(character);
        }

        if (chunk.Length > 0)
        {
            yield return chunk.ToString();
        }
    }

    private static double MeasureText(string value, int fontSize) =>
        value.Sum(character => GetCharacterWidth(character) * fontSize);

    private static double GetCharacterWidth(char character) =>
        character switch
        {
            ' ' => 0.28,
            'W' => 0.94,
            'M' => 0.83,
            'm' => 0.83,
            'w' => 0.72,
            'i' or 'l' or 'I' or '!' or '|' => 0.28,
            '.' or ',' or ':' or ';' or '\'' => 0.28,
            _ when char.IsUpper(character) => 0.67,
            _ when char.IsDigit(character) => 0.56,
            _ => 0.56,
        };

    private static byte[] BuildPdf(IReadOnlyList<PdfPage> pages, string title, string author)
    {
        var objects = new List<string>();
        var pageObjectNumbers = Enumerable.Range(0, pages.Count).Select(index => 6 + (index * 2)).ToArray();
        var kids = string.Join(' ', pageObjectNumbers.Select(number => $"{number} 0 R"));

        objects.Add("<< /Type /Catalog /Pages 2 0 R >>");
        objects.Add($"<< /Type /Pages /Kids [{kids}] /Count {pages.Count} >>");
        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>");

        for (var index = 0; index < pages.Count; index++)
        {
            var contentObjectNumber = pageObjectNumbers[index] + 1;
            objects.Add(
                $"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PageWidth} {PageHeight}] " +
                $"/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> " +
                $"/Contents {contentObjectNumber} 0 R >>");
            var stream = RenderPage(pages[index], index + 1, pages.Count, title);
            objects.Add($"<< /Length {Encoding.ASCII.GetByteCount(stream)} >>\nstream\n{stream}\nendstream");
        }

        using var output = new MemoryStream();
        Write(output, "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
        var offsets = new List<long> { 0 };

        for (var index = 0; index < objects.Count; index++)
        {
            offsets.Add(output.Position);
            Write(output, $"{index + 1} 0 obj\n{objects[index]}\nendobj\n");
        }

        var xref = output.Position;
        Write(output, $"xref\n0 {objects.Count + 1}\n0000000000 65535 f \n");
        foreach (var offset in offsets.Skip(1))
        {
            Write(output, $"{offset:0000000000} 00000 n \n");
        }

        Write(
            output,
            $"trailer\n<< /Size {objects.Count + 1} /Root 1 0 R " +
            $"/Info << /Title ({Escape(title)}) /Author ({Escape(author)}) " +
            $"/Creator (WoWiki PDF Service) >> >>\nstartxref\n{xref}\n%%EOF");
        return output.ToArray();
    }

    private static string RenderPage(
        PdfPage page,
        int pageNumber,
        int pageCount,
        string title)
    {
        var content = new StringBuilder();
        foreach (var rectangle in page.Rectangles)
        {
            content.Append(
                CultureInfo.InvariantCulture,
                $"q {rectangle.Color.Red:0.###} {rectangle.Color.Green:0.###} {rectangle.Color.Blue:0.###} rg " +
                $"{rectangle.X:0.###} {rectangle.Y:0.###} {rectangle.Width:0.###} {rectangle.Height:0.###} re f Q\n");
        }

        content.Append(
            CultureInfo.InvariantCulture,
            $"q {Rule.Red:0.###} {Rule.Green:0.###} {Rule.Blue:0.###} rg " +
            $"{Margin} 45 {ContentWidth} 1 re f Q\n");

        var footerTitle = Ellipsize(title, 48);
        var text = page.Text.Concat(
        [
            new DrawText(footerTitle, Margin, 27, 8, RegularFont, MutedInk),
            new DrawText($"Page {pageNumber} of {pageCount}", PageWidth - Margin - 58, 27, 8, RegularFont, MutedInk),
        ]);

        content.Append("BT\n");
        foreach (var line in text)
        {
            content.Append(
                CultureInfo.InvariantCulture,
                $"{line.Color.Red:0.###} {line.Color.Green:0.###} {line.Color.Blue:0.###} rg\n" +
                $"/{line.Font} {line.FontSize} Tf\n" +
                $"1 0 0 1 {line.X:0.###} {line.Y:0.###} Tm\n" +
                $"({Escape(line.Value)}) Tj\n");
        }

        return content.Append("ET").ToString();
    }

    private static string Ellipsize(string value, int maxLength) =>
        value.Length <= maxLength ? value : $"{value[..(maxLength - 3)]}...";

    private static string Escape(string value)
    {
        var normalized = value.Normalize(NormalizationForm.FormD);
        var ascii = new string(normalized.Where(character =>
            CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark && character <= 127).ToArray());
        return ascii.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
    }

    private static void Write(Stream stream, string value) => stream.Write(Encoding.ASCII.GetBytes(value));

    private sealed class PdfPage
    {
        public List<DrawRectangle> Rectangles { get; } = [];
        public List<DrawText> Text { get; } = [];
    }

    private sealed record DrawText(
        string Value,
        double X,
        double Y,
        int FontSize,
        string Font,
        PdfColor Color);

    private sealed record DrawRectangle(
        double X,
        double Y,
        double Width,
        double Height,
        PdfColor Color);

    private sealed record PdfColor(double Red, double Green, double Blue);
}
