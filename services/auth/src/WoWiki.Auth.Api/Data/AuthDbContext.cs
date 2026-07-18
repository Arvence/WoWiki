using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WoWiki.Auth.Api.Identity;

namespace WoWiki.Auth.Api.Data;

public sealed class AuthDbContext(DbContextOptions<AuthDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<ApplicationUser>(user =>
        {
            user.Property(item => item.DisplayName).HasMaxLength(60).IsRequired();
            user.Property(item => item.CreatedAtUtc).IsRequired();
        });
    }
}
