namespace WoWiki.Gateway.Infrastructure;

internal static class ClientRateLimitPartition
{
    internal static string GetPartitionKey(HttpContext context)
    {
        var address = context.Connection.RemoteIpAddress;
        if (address?.IsIPv4MappedToIPv6 == true)
        {
            address = address.MapToIPv4();
        }

        return address?.ToString() ?? "unknown";
    }
}
