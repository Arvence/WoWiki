using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using WoWiki.Gateway.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole();

ValidateProductionConfiguration(builder);

var permitLimit = GetPositiveSetting(builder.Configuration, "RateLimiting:PermitLimit", 300);
var windowSeconds = GetPositiveSetting(builder.Configuration, "RateLimiting:WindowSeconds", 60);

builder.Services.AddProblemDetails();

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
                title = "Too many requests",
                status = StatusCodes.Status429TooManyRequests,
                traceId = context.HttpContext.TraceIdentifier,
            },
            options: null,
            contentType: "application/problem+json",
            cancellationToken);
    };
    options.AddPolicy("api", context => RateLimitPartition.GetFixedWindowLimiter(
        ClientRateLimitPartition.GetPartitionKey(context),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = TimeSpan.FromSeconds(windowSeconds),
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            AutoReplenishment = true,
        }));
});

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetRequiredSection("ReverseProxy"));

var app = builder.Build();

if (builder.Configuration.GetValue("ForwardedHeaders:Enabled", false))
{
    app.UseForwardedHeaders();
}

if (builder.Configuration.GetValue("Security:UseHsts", !app.Environment.IsDevelopment()))
{
    app.UseHsts();
}

if (builder.Configuration.GetValue("Security:RedirectToHttps", false))
{
    app.UseHttpsRedirection();
}

app.UseMiddleware<GatewayRequestMiddleware>();
app.UseExceptionHandler();
app.UseRateLimiter();

app.MapGet("/gateway/health", (IHostEnvironment environment) => Results.Ok(new
{
    status = "healthy",
    service = "wowiki-gateway",
    environment = environment.EnvironmentName,
    timestampUtc = DateTimeOffset.UtcNow,
}));

app.MapReverseProxy();

app.Run();

static int GetPositiveSetting(IConfiguration configuration, string key, int fallback)
{
    var value = configuration.GetValue(key, fallback);
    return value > 0
        ? value
        : throw new InvalidOperationException($"{key} must be greater than zero.");
}

static void ValidateProductionConfiguration(WebApplicationBuilder builder)
{
    if (builder.Environment.IsDevelopment() || builder.Environment.IsEnvironment("Testing"))
    {
        return;
    }

    var allowedHosts = builder.Configuration["AllowedHosts"];
    if (string.IsNullOrWhiteSpace(allowedHosts) ||
        allowedHosts.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Any(host => host is "*"))
    {
        throw new InvalidOperationException(
            "AllowedHosts must contain the public gateway host names when running outside Development.");
    }

    if (builder.Configuration.GetValue("ForwardedHeaders:Enabled", false) &&
        !builder.Configuration.GetSection("ForwardedHeaders:KnownProxies").GetChildren().Any())
    {
        throw new InvalidOperationException(
            "At least one ForwardedHeaders:KnownProxies address is required when forwarded headers are enabled.");
    }
}

public partial class Program;
