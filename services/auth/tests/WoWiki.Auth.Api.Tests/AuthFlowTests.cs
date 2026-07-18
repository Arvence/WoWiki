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

        var healthResponse = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, healthResponse.StatusCode);

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
}
