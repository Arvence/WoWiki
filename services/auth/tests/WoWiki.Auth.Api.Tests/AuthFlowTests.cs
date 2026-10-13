using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WoWiki.Auth.Api.Data;
using WoWiki.Auth.Api.Identity;

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
    public async Task UserCanRegisterUseSessionLogoutAndLogin()
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

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "  VALIDATION@wowiki.local  ",
            Password = "ClassicWow1",
        });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var signedInResponse = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, signedInResponse.StatusCode);
        var signedInUser = await signedInResponse.Content.ReadFromJsonAsync<UserResponse>();
        Assert.Equal(user?.Email, signedInUser?.Email);
        Assert.Contains("user", signedInUser?.Roles ?? []);
    }

    [Theory]
    [InlineData("{}", "email")]
    [InlineData("{\"email\":null,\"password\":\"ClassicWow1\"}", "email")]
    [InlineData("{\"email\":\"   \",\"password\":\"ClassicWow1\"}", "email")]
    [InlineData("{\"email\":\"not-an-email\",\"password\":\"ClassicWow1\"}", "email")]
    [InlineData("{\"email\":\"validation@wowiki.local\"}", "password")]
    [InlineData("{\"email\":\"validation@wowiki.local\",\"password\":null}", "password")]
    [InlineData("{\"email\":\"validation@wowiki.local\",\"password\":\"\"}", "password")]
    [InlineData("{\"email\":\"validation@wowiki.local\",\"password\":\"   \"}", "password")]
    public async Task MalformedLoginReturnsFieldValidationErrors(string json, string field)
    {
        using var client = _factory!.CreateClient();
        var response = await client.PostAsync("/api/auth/login", new StringContent(json, Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out var errors));
        Assert.NotEmpty(errors.EnumerateArray());
        Assert.False(response.Headers.Contains("Set-Cookie"));
    }

    [Theory]
    [InlineData("{")]
    [InlineData("null")]
    [InlineData("{\"email\":123,\"password\":\"ClassicWow1\"}")]
    [InlineData("{\"email\":\"validation@wowiki.local\",\"password\":123}")]
    public async Task InvalidLoginJsonReturnsBadRequest(string json)
    {
        using var client = _factory!.CreateClient();
        var response = await client.PostAsync("/api/auth/login", new StringContent(json, Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.False(response.Headers.Contains("Set-Cookie"));
    }

    [Fact]
    public async Task WrongPasswordDoesNotCreateASession()
    {
        using var client = _factory!.CreateClient();
        var registration = await client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = "validation@wowiki.local",
            Password = "ClassicWow1",
            DisplayName = "Validation User",
        });
        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync("/api/auth/logout", null)).StatusCode);

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "validation@wowiki.local",
            Password = "WrongPassword1",
        });
        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
        Assert.False(login.Headers.Contains("Set-Cookie"));
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Theory]
    [InlineData(null, "ClassicWow1", "Validation User")]
    [InlineData("not-an-email", "ClassicWow1", "Validation User")]
    [InlineData("validation@wowiki.local", null, "Validation User")]
    [InlineData("validation@wowiki.local", "weak", "Validation User")]
    [InlineData("validation@wowiki.local", "ClassicWow1", null)]
    [InlineData("validation@wowiki.local", "ClassicWow1", "   ")]
    public async Task InvalidRegistrationDoesNotCreateAnAccount(string? email, string? password, string? displayName)
    {
        using var client = _factory!.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new { email, password, displayName });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.False(response.Headers.Contains("Set-Cookie"));
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
        await using var scope = _factory.Services.CreateAsyncScope();
        Assert.Empty(await scope.ServiceProvider.GetRequiredService<AuthDbContext>().Users.ToListAsync());
    }

    [Fact]
    public async Task DuplicateRegistrationDoesNotSignInOrCreateAnotherAccount()
    {
        var input = new { Email = "validation@wowiki.local", Password = "ClassicWow1", DisplayName = "Validation User" };
        using var firstClient = _factory!.CreateClient();
        Assert.Equal(HttpStatusCode.Created, (await firstClient.PostAsJsonAsync("/api/auth/register", input)).StatusCode);

        using var secondClient = _factory.CreateClient();
        var response = await secondClient.PostAsJsonAsync("/api/auth/register", input);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.False(response.Headers.Contains("Set-Cookie"));
        Assert.Equal(HttpStatusCode.Unauthorized, (await secondClient.GetAsync("/api/auth/me")).StatusCode);
        await using var scope = _factory.Services.CreateAsyncScope();
        Assert.Single(await scope.ServiceProvider.GetRequiredService<AuthDbContext>().Users.ToListAsync());
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task FailedRoleAssignmentRollsBackRegistrationAndAllowsRetry(bool throwOnFailure)
    {
        var validator = new RejectRoleAssignmentValidator(throwOnFailure);
        using var factory = _factory!.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services => services.AddSingleton<IUserValidator<ApplicationUser>>(validator));
        });
        using var client = factory.CreateClient();
        var input = new { Email = "validation@wowiki.local", Password = "ClassicWow1", DisplayName = "Validation User" };

        var response = await client.PostAsJsonAsync("/api/auth/register", input);
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.False(response.Headers.Contains("Set-Cookie"));
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var database = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
            Assert.Empty(await database.Users.ToListAsync());
            Assert.Empty(await database.UserRoles.ToListAsync());
        }

        validator.Reject = false;
        var retry = await client.PostAsJsonAsync("/api/auth/register", input);
        Assert.Equal(HttpStatusCode.Created, retry.StatusCode);
        var currentUser = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, currentUser.StatusCode);
        var user = await currentUser.Content.ReadFromJsonAsync<UserResponse>();
        Assert.Contains("user", user?.Roles ?? []);
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

    private sealed class RejectRoleAssignmentValidator(bool throwOnFailure) : IUserValidator<ApplicationUser>
    {
        public bool Reject { get; set; } = true;

        public async Task<IdentityResult> ValidateAsync(UserManager<ApplicationUser> manager, ApplicationUser user)
        {
            if (!Reject || await manager.FindByIdAsync(user.Id) is null) return IdentityResult.Success;
            if (throwOnFailure) throw new InvalidOperationException("Simulated role-assignment failure.");
            return IdentityResult.Failed(new IdentityError { Code = "RoleAssignmentFailed", Description = "Simulated role-assignment failure." });
        }
    }

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
