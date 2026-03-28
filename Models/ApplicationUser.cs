using Microsoft.AspNetCore.Identity;

namespace MotoRota.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Role { get; set; } = "User";
    }
}