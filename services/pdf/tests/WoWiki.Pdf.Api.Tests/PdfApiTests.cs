using System.Net;
using System.Net.Http.Json;
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
}
