namespace WoWiki.Auth.Api.Contracts;

public sealed record RegisterRequest(string Email, string Password, string DisplayName);
public sealed record LoginRequest(string Email, string Password, bool RememberMe = false);
public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public sealed record UpdateProfileRequest(string Email, string DisplayName);
public sealed record UserResponse(string Id, string Email, string DisplayName, DateTimeOffset CreatedAtUtc, IReadOnlyCollection<string> Roles);
