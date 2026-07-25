using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace WoWiki.Gateway.Tests;

public sealed class GatewayIntegrationTests : IAsyncLifetime
{
    private readonly Dictionary<string, MockDownstream> _downstreams =
        new(StringComparer.OrdinalIgnoreCase);
    private WebApplicationFactory<Program>? _factory;

    public async Task InitializeAsync()
    {
        foreach (var service in new[] { "frontend", "backend", "auth", "pdf" })
        {
            var downstream = new MockDownstream(service);
            await downstream.StartAsync();
            _downstreams.Add(service, downstream);
        }

        _factory = CreateFactory();
    }

    [Theory]
    [InlineData("/", "frontend")]
    [InlineData("/news/example", "frontend")]
    [InlineData("/api/classes", "backend")]
    [InlineData("/images/logo.png", "backend")]
    [InlineData("/api/auth/me", "auth")]
    [InlineData("/api/pdf/news", "pdf")]
    public async Task RoutesRequestsToTheExpectedService(string path, string expectedService)
    {
        using var client = CreateClient(_factory!);

        var response = await client.GetAsync(path);
        var body = await response.Content.ReadFromJsonAsync<DownstreamResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(expectedService, body?.Service);
        Assert.Equal(path, body?.Path);
    }

    [Fact]
    public async Task AddsSecurityHeadersAndPropagatesNormalizedCorrelationId()
    {
        using var client = CreateClient(_factory!);
        var correlationId = Guid.NewGuid();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/classes");
        request.Headers.Add("X-Correlation-ID", correlationId.ToString());

        var response = await client.SendAsync(request);
        var body = await response.Content.ReadFromJsonAsync<DownstreamResponse>();

        Assert.Equal(correlationId.ToString("N"), response.Headers.GetValues("X-Correlation-ID").Single());
        Assert.Equal(correlationId.ToString("N"), body?.CorrelationId);
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("SAMEORIGIN", response.Headers.GetValues("X-Frame-Options").Single());
        Assert.Equal(
            "strict-origin-when-cross-origin",
            response.Headers.GetValues("Referrer-Policy").Single());
    }

    [Fact]
    public async Task ExposesGatewayHealth()
    {
        using var client = CreateClient(_factory!);

        var response = await client.GetAsync("/gateway/health");
        var health = await response.Content.ReadFromJsonAsync<HealthResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("healthy", health?.Status);
        Assert.Equal("wowiki-gateway", health?.Service);
    }

    [Fact]
    public async Task RejectsRequestsThatExceedTheClientApiLimit()
    {
        using var factory = CreateFactory(new Dictionary<string, string?>
        {
            ["RateLimiting:PermitLimit"] = "2",
            ["RateLimiting:WindowSeconds"] = "60",
        });
        using var client = CreateClient(factory);

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/limit-one")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/limit-two")).StatusCode);

        var rejected = await client.GetAsync("/api/limit-three");

        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
        Assert.True(rejected.Headers.Contains("Retry-After"));
        Assert.Equal("application/problem+json", rejected.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task ReturnsBadGatewayWhenADestinationIsUnavailable()
    {
        using var factory = CreateFactory(new Dictionary<string, string?>
        {
            ["ReverseProxy:Clusters:pdf:Destinations:development:Address"] =
                "http://127.0.0.1:1/",
        });
        using var client = CreateClient(factory);

        var response = await client.GetAsync("/api/pdf/unavailable");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    public async Task DisposeAsync()
    {
        if (_factory is not null)
        {
            await _factory.DisposeAsync();
        }

        foreach (var downstream in _downstreams.Values)
        {
            await downstream.DisposeAsync();
        }
    }

    private WebApplicationFactory<Program> CreateFactory(
        IReadOnlyDictionary<string, string?>? overrides = null)
    {
        var settings = new Dictionary<string, string?>
        {
            ["Security:UseHsts"] = "false",
            ["Security:RedirectToHttps"] = "false",
            ["ReverseProxy:Clusters:frontend:Destinations:development:Address"] =
                _downstreams["frontend"].Address,
            ["ReverseProxy:Clusters:backend:Destinations:development:Address"] =
                _downstreams["backend"].Address,
            ["ReverseProxy:Clusters:auth:Destinations:development:Address"] =
                _downstreams["auth"].Address,
            ["ReverseProxy:Clusters:pdf:Destinations:development:Address"] =
                _downstreams["pdf"].Address,
        };

        if (overrides is not null)
        {
            foreach (var pair in overrides)
            {
                settings[pair.Key] = pair.Value;
            }
        }

        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            foreach (var pair in settings)
            {
                builder.UseSetting(pair.Key, pair.Value);
            }
        });
    }

    private static HttpClient CreateClient(WebApplicationFactory<Program> factory) =>
        factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
        });

    private sealed record DownstreamResponse(
        string Service,
        string Path,
        string? CorrelationId);

    private sealed record HealthResponse(
        string Status,
        string Service);
}
