using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using WoWiki.Auth.Api.Contracts;
using WoWiki.Auth.Api.Identity;

namespace WoWiki.Auth.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", RegisterAsync).RequireRateLimiting("auth-attempts");
        group.MapPost("/login", LoginAsync).RequireRateLimiting("auth-attempts");
        group.MapPost("/logout", LogoutAsync).RequireAuthorization();
        group.MapGet("/me", GetCurrentUserAsync).RequireAuthorization();
        group.MapPatch("/me", UpdateProfileAsync).RequireAuthorization();
        group.MapPost("/change-password", ChangePasswordAsync).RequireAuthorization();

        return endpoints;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        var validationErrors = ValidateRegistration(request);
        if (validationErrors.Count > 0) return Results.ValidationProblem(validationErrors);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            DisplayName = request.DisplayName.Trim(),
        };
        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded) return IdentityValidationProblem(result);

        await userManager.AddToRoleAsync(user, "user");
        await signInManager.SignInAsync(user, isPersistent: false);
        return Results.Created("/api/auth/me", await ToResponseAsync(user, userManager));
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null) return Results.Unauthorized();

        var result = await signInManager.PasswordSignInAsync(user, request.Password, request.RememberMe, lockoutOnFailure: true);
        if (result.IsLockedOut)
        {
            return Results.Problem("Too many failed attempts. Try again later.", statusCode: StatusCodes.Status423Locked);
        }
        if (!result.Succeeded) return Results.Unauthorized();

        return Results.Ok(await ToResponseAsync(user, userManager));
    }

    private static async Task<IResult> LogoutAsync(SignInManager<ApplicationUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> GetCurrentUserAsync(
        ClaimsPrincipal principal,
        UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.GetUserAsync(principal);
        return user is null ? Results.Unauthorized() : Results.Ok(await ToResponseAsync(user, userManager));
    }

    private static async Task<IResult> ChangePasswordAsync(
        ChangePasswordRequest request,
        ClaimsPrincipal principal,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        var user = await userManager.GetUserAsync(principal);
        if (user is null) return Results.Unauthorized();

        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded) return IdentityValidationProblem(result);

        await signInManager.RefreshSignInAsync(user);
        return Results.NoContent();
    }

    private static async Task<IResult> UpdateProfileAsync(
        UpdateProfileRequest request,
        ClaimsPrincipal principal,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        var user = await userManager.GetUserAsync(principal);
        if (user is null) return Results.Unauthorized();
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.DisplayName))
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["profile"] = ["Email and display name are required."] });
        if (request.DisplayName.Trim().Length > 60)
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["displayName"] = ["Display name cannot exceed 60 characters."] });

        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null && existing.Id != user.Id)
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["email"] = ["An account with this email already exists."] });

        user.DisplayName = request.DisplayName.Trim();
        user.Email = email;
        user.UserName = email;
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded) return IdentityValidationProblem(result);
        await signInManager.RefreshSignInAsync(user);
        return Results.Ok(await ToResponseAsync(user, userManager));
    }

    private static Dictionary<string, string[]> ValidateRegistration(RegisterRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.Email)) errors["email"] = ["Email is required."];
        if (string.IsNullOrWhiteSpace(request.Password)) errors["password"] = ["Password is required."];
        if (string.IsNullOrWhiteSpace(request.DisplayName)) errors["displayName"] = ["Display name is required."];
        else if (request.DisplayName.Trim().Length > 60) errors["displayName"] = ["Display name cannot exceed 60 characters."];
        return errors;
    }

    private static IResult IdentityValidationProblem(IdentityResult result) => Results.ValidationProblem(
        result.Errors
            .GroupBy(error => string.IsNullOrWhiteSpace(error.Code) ? "identity" : error.Code)
            .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray()));

    private static async Task<UserResponse> ToResponseAsync(ApplicationUser user, UserManager<ApplicationUser> userManager) =>
        new(user.Id, user.Email ?? string.Empty, user.DisplayName, user.CreatedAtUtc, [.. await userManager.GetRolesAsync(user)]);
}
