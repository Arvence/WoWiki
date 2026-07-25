using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace WoWiki.Gateway.Tests;

internal sealed class MockDownstream(string serviceName) : IAsyncDisposable
{
    private WebApplication? _application;

    internal string Address { get; private set; } = string.Empty;

    internal async Task StartAsync()
    {
        var builder = WebApplication.CreateSlimBuilder();
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Listen(IPAddress.Loopback, 0);
        });

        _application = builder.Build();
        _application.Map("/{**path}", (HttpContext context) => Results.Json(new
        {
            service = serviceName,
            path = context.Request.Path.Value,
            correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault(),
        }));

        await _application.StartAsync();

        var addresses = _application.Services
            .GetRequiredService<IServer>()
            .Features
            .Get<IServerAddressesFeature>()
            ?.Addresses;
        Address = addresses?.Single()
            ?? throw new InvalidOperationException("The mock downstream did not bind an address.");
    }

    public async ValueTask DisposeAsync()
    {
        if (_application is not null)
        {
            await _application.DisposeAsync();
        }
    }
}
