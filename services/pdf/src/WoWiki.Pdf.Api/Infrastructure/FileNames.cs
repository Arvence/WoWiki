using System.Text.RegularExpressions;

namespace WoWiki.Pdf.Api.Infrastructure;

internal static partial class FileNames
{
    public static string Sanitize(string value)
    {
        var cleaned = InvalidFileNameCharacters().Replace(value.Trim(), "-").Trim('-', '_');
        return string.IsNullOrWhiteSpace(cleaned) ? "wowiki-news" : cleaned[..Math.Min(cleaned.Length, 80)];
    }

    [GeneratedRegex("[^a-zA-Z0-9_-]+")]
    private static partial Regex InvalidFileNameCharacters();
}
