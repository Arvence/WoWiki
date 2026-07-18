using Microsoft.AspNetCore.Identity;

namespace WoWiki.Auth.Api.Identity;

public sealed class ApplicationUser : IdentityUser
{
    public required string DisplayName { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; } = DateTimeOffset.UtcNow;
}
