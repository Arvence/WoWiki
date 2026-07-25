using System.Net;
using Microsoft.AspNetCore.Http;
using WoWiki.Gateway.Infrastructure;

namespace WoWiki.Gateway.Tests;

public sealed class ClientRateLimitPartitionTests
{
    [Fact]
    public void UsesNormalizedRemoteIpAddressAsPartitionKey()
    {
        var firstClient = new DefaultHttpContext();
        firstClient.Connection.RemoteIpAddress = IPAddress.Parse("192.0.2.10");
        var secondClient = new DefaultHttpContext();
        secondClient.Connection.RemoteIpAddress = IPAddress.Parse("192.0.2.11");
        var mappedClient = new DefaultHttpContext();
        mappedClient.Connection.RemoteIpAddress = IPAddress.Parse("::ffff:192.0.2.10");

        Assert.Equal("192.0.2.10", ClientRateLimitPartition.GetPartitionKey(firstClient));
        Assert.Equal("192.0.2.11", ClientRateLimitPartition.GetPartitionKey(secondClient));
        Assert.Equal("192.0.2.10", ClientRateLimitPartition.GetPartitionKey(mappedClient));
    }
}
