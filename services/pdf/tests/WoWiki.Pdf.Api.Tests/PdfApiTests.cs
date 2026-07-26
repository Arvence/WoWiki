using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace WoWiki.Pdf.Api.Tests;

public sealed class PdfApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public PdfApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task HealthPropagatesNormalizedCorrelationId()
    {
        var correlationId = Guid.NewGuid();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/health");
        request.Headers.Add("X-Correlation-ID", correlationId.ToString());

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            correlationId.ToString("N"),
            response.Headers.GetValues("X-Correlation-ID").Single());
    }

    [Fact]
    public async Task InvalidArticleReturnsValidationProblem()
    {
        var response = await _client.PostAsJsonAsync("/api/pdf/news", new
        {
            Title = string.Empty,
            Summary = string.Empty,
            Content = string.Empty,
            Category = "News",
            Author = string.Empty,
            UpdatedAt = DateTimeOffset.UtcNow,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task ValidArticleReturnsDownloadablePdf()
    {
        var response = await _client.PostAsJsonAsync("/api/pdf/news", new
        {
            Title = "Gateway Integration",
            Summary = "A test article.",
            Content = "WoWiki routes this request through its dedicated PDF service.",
            Category = "Engineering",
            Author = "WoWiki",
            UpdatedAt = DateTimeOffset.UtcNow,
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/pdf", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("Gateway-Integration.pdf", response.Content.Headers.ContentDisposition?.FileNameStar);
        Assert.NotEmpty(await response.Content.ReadAsByteArrayAsync());
    }

    [Fact]
    public async Task PunctuationOnlyTitleUsesFallbackDownloadName()
    {
        var response = await _client.PostAsJsonAsync("/api/pdf/news", new
        {
            Title = "___",
            Summary = string.Empty,
            Content = "A valid article whose title cannot be used as a filename.",
            Category = "News",
            Author = "WoWiki",
            UpdatedAt = DateTimeOffset.UtcNow,
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("wowiki-news.pdf", response.Content.Headers.ContentDisposition?.FileNameStar);
    }

    [Fact]
    public async Task LongArticleUsesBrandedContinuationPages()
    {
        var paragraph =
            "Azeroth rewards preparation, patience, and travelers who look out for one another.";
        var response = await _client.PostAsJsonAsync("/api/pdf/news", new
        {
            Title = "A Long Journey Across Azeroth",
            Summary = "A visual export test for longer WoWiki articles.",
            Content = string.Join("\n\n", Enumerable.Repeat(paragraph, 100)),
            Category = "Guide",
            Author = "WoWiki",
            UpdatedAt = DateTimeOffset.UtcNow,
        });

        var pdf = Encoding.ASCII.GetString(await response.Content.ReadAsByteArrayAsync());
        var pageCount = Regex.Match(pdf, @"/Type /Pages /Kids \[.*?\] /Count (\d+)");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(pageCount.Success);
        Assert.True(int.Parse(pageCount.Groups[1].Value) > 1);
        Assert.Contains("/BaseFont /Helvetica-Bold", pdf);
        Assert.Contains("/BaseFont /Helvetica-Oblique", pdf);
        Assert.Contains("(CONTINUED) Tj", pdf);
        Assert.Contains("(Page 1 of ", pdf);
    }
}
