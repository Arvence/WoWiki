using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WoWiki.Auth.Api.Data;
using WoWiki.Auth.Api.Endpoints;
using WoWiki.Auth.Api.Identity;

SQLitePCL.raw.SetProvider(new SQLitePCL.SQLite3Provider_winsqlite3());

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var connectionString = builder.Configuration.GetConnectionString("AuthDatabase")
    ?? throw new InvalidOperationException("Connection string 'AuthDatabase' is not configured.");
var authAttemptPermitLimit = builder.Configuration.GetValue("RateLimiting:AuthAttempts:PermitLimit", 10);
var authAttemptWindowSeconds = builder.Configuration.GetValue("RateLimiting:AuthAttempts:WindowSeconds", 60);

if (authAttemptPermitLimit <= 0 || authAttemptWindowSeconds <= 0)
{
    throw new InvalidOperationException("Auth attempt rate-limit settings must be greater than zero.");
}

Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "Data"));
var dataProtectionKeysDirectory = new DirectoryInfo(
    Path.Combine(builder.Environment.ContentRootPath, "DataProtection-Keys"));
dataProtectionKeysDirectory.Create();

builder.Services.AddProblemDetails();
builder.Services
    .AddDataProtection()
    .SetApplicationName("WoWiki.Auth")
    .PersistKeysToFileSystem(dataProtectionKeysDirectory);
builder.Services.AddDbContext<AuthDbContext>(options => options.UseSqlite(connectionString));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 10;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Lockout.AllowedForNewUsers = true;
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
    })
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = builder.Configuration["Auth:CookieName"] ?? "wowiki.auth";
    options.Cookie.Path = "/";
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(builder.Configuration.GetValue("Auth:SessionDays", 7));
    options.SlidingExpiration = true;
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;

    foreach (var configuredProxy in builder.Configuration
                 .GetSection("ForwardedHeaders:KnownProxies")
                 .Get<string[]>() ?? [])
    {
        if (!IPAddress.TryParse(configuredProxy, out var proxyAddress))
        {
            throw new InvalidOperationException(
                $"ForwardedHeaders:KnownProxies contains an invalid IP address: '{configuredProxy}'.");
        }

        options.KnownProxies.Add(proxyAddress);
    }
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds)).ToString();
        }

        await context.HttpContext.Response.WriteAsJsonAsync(
            new
            {
                type = "https://httpstatuses.com/429",
                title = "Too many authentication attempts",
                status = StatusCodes.Status429TooManyRequests,
                traceId = context.HttpContext.TraceIdentifier,
            },
            options: null,
            contentType: "application/problem+json",
            cancellationToken);
    };
    options.AddPolicy("auth-attempts", context => RateLimitPartition.GetFixedWindowLimiter(
        GetClientAddress(context),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = authAttemptPermitLimit,
            Window = TimeSpan.FromSeconds(authAttemptWindowSeconds),
            QueueLimit = 0,
        }));
});

var app = builder.Build();

if (builder.Configuration.GetValue("ForwardedHeaders:Enabled", true))
{
    app.UseForwardedHeaders();
}

app.Use(async (context, next) =>
{
    const string correlationHeader = "X-Correlation-ID";
    var suppliedCorrelationId = context.Request.Headers[correlationHeader].FirstOrDefault();
    var correlationId = Guid.TryParse(suppliedCorrelationId, out var parsedId)
        ? parsedId.ToString("N")
        : Guid.NewGuid().ToString("N");

    context.TraceIdentifier = correlationId;
    context.Request.Headers[correlationHeader] = correlationId;
    context.Response.OnStarting(() =>
    {
        context.Response.Headers[correlationHeader] = correlationId;
        return Task.CompletedTask;
    });

    await next();
});

app.UseExceptionHandler();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", async (AuthDbContext database, CancellationToken cancellationToken) =>
    await database.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem("The auth database is unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable));
app.MapAuthEndpoints();

await app.Services.InitializeIdentityDatabaseAsync();
await app.RunAsync();

static string GetClientAddress(HttpContext context)
{
    var address = context.Connection.RemoteIpAddress;
    if (address?.IsIPv4MappedToIPv6 == true)
    {
        address = address.MapToIPv4();
    }

    return address?.ToString() ?? "unknown";
}

public partial class Program;
