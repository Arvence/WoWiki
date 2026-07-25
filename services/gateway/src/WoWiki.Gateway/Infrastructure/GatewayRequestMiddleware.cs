using System.Diagnostics;

namespace WoWiki.Gateway.Infrastructure;

internal sealed class GatewayRequestMiddleware(
    RequestDelegate next,
    ILogger<GatewayRequestMiddleware> logger)
{
    private const string CorrelationHeader = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        var suppliedCorrelationId = context.Request.Headers[CorrelationHeader].FirstOrDefault();
        var correlationId = Guid.TryParse(suppliedCorrelationId, out var parsedId)
            ? parsedId.ToString("N")
            : Guid.NewGuid().ToString("N");

        context.TraceIdentifier = correlationId;
        context.Request.Headers[CorrelationHeader] = correlationId;
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[CorrelationHeader] = correlationId;
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
            return Task.CompletedTask;
        });

        using var loggingScope = logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
        });
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await next(context);
        }
        finally
        {
            stopwatch.Stop();
            logger.LogInformation(
                "Gateway request {RequestMethod} {RequestPath} completed with {StatusCode} in {ElapsedMilliseconds:F2} ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
