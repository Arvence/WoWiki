using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace WoWiki.Auth.Api.Tests;

public sealed class AuthFlowTests : IAsyncLifetime
{
    private readonly string _databasePath = Path.Combine(
        Directory.GetCurrentDirectory(),
        $"wowiki-auth-tests-{Guid.NewGuid():N}.db");

    private WebApplicationFactory<Program>? _factory;

    public Task InitializeAsync()
    {
        _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.UseSetting(
                "ConnectionStrings:AuthDatabase",
                $"Data Source={_databasePath};Cache=Shared;Foreign Keys=True;Pooling=False");
        });

        return Task.CompletedTask;
    }

    [Fact]
    public async Task UserCanRegisterUseSessionAndLogout()
    {
        using var client = _factory!.CreateClient(new WebApplicationFactoryClientOptions
        {
            HandleCookies = true,
        });

        var correlationId = Guid.NewGuid();
        using var healthRequest = new HttpRequestMessage(HttpMethod.Get, "/health");
        healthRequest.Headers.Add("X-Correlation-ID", correlationId.ToString());
        var healthResponse = await client.SendAsync(healthRequest);
        Assert.Equal(HttpStatusCode.OK, healthResponse.StatusCode);
        Assert.Equal(
            correlationId.ToString("N"),
            healthResponse.Headers.GetValues("X-Correlation-ID").Single());

        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = "validation@wowiki.local",
            Password = "ClassicWow1",
            DisplayName = "Validation User",
        });
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var meResponse = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        var user = await meResponse.Content.ReadFromJsonAsync<UserResponse>();
        Assert.Equal("validation@wowiki.local", user?.Email);
        Assert.Contains("user", user?.Roles ?? []);

        var logoutResponse = await client.PostAsync("/api/auth/logout", content: null);
        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);

        var signedOutResponse = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, signedOutResponse.StatusCode);
    }

    [Fact]
    public async Task AuthAttemptLimitUsesTheForwardedClientAddress()
    {
        using var factory = _factory!.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("RateLimiting:AuthAttempts:PermitLimit", "1");
            builder.UseSetting("RateLimiting:AuthAttempts:WindowSeconds", "60");
        });
        using var client = factory.CreateClient();

        var firstAttempt = await SendLoginAsync(client, "192.0.2.10");
        var repeatedAttempt = await SendLoginAsync(client, "192.0.2.10");
        var differentClientAttempt = await SendLoginAsync(client, "192.0.2.11");

        Assert.Equal(HttpStatusCode.Unauthorized, firstAttempt.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, repeatedAttempt.StatusCode);
        Assert.True(repeatedAttempt.Headers.Contains("Retry-After"));
        Assert.Equal(HttpStatusCode.Unauthorized, differentClientAttempt.StatusCode);
    }

    public async Task DisposeAsync()
    {
        if (_factory is not null)
        {
            await _factory.DisposeAsync();
        }

        foreach (var suffix in new[] { string.Empty, "-shm", "-wal" })
        {
            var path = _databasePath + suffix;
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
    }

    private sealed record UserResponse(string Email, DateTimeOffset CreatedAtUtc, IReadOnlyCollection<string> Roles);

    private static async Task<HttpResponseMessage> SendLoginAsync(HttpClient client, string forwardedAddress)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(new
            {
                Email = "missing@wowiki.local",
                Password = "ClassicWow1",
                RememberMe = false,
            }),
        };
        request.Headers.Add("X-Forwarded-For", forwardedAddress);
        return await client.SendAsync(request);
    }
}
