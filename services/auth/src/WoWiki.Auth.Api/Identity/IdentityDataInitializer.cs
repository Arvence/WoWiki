using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WoWiki.Auth.Api.Data;

namespace WoWiki.Auth.Api.Identity;

public static class IdentityDataInitializer
{
    private static readonly string[] Roles = ["user", "moderator", "admin"];

    public static async Task InitializeIdentityDatabaseAsync(this IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        await database.Database.MigrateAsync();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(role));
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException($"Unable to create identity role '{role}'.");
                }
            }
        }
    }
}
