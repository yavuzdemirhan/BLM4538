using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MotoRota.Models;
using MotoRota.Models.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MotoRota.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;

        // Admin e-postasi appsettings.json icerisinden okunabilir;
        // simdilik sabit tanimli birakiyoruz.
        private const string AdminEmail = "yselim_demirhan@hotmail.com";

        public AccountController(UserManager<ApplicationUser> userManager, IConfiguration config)
        {
            _userManager = userManager;
            _config = config;
        }

        /// <summary>Yeni kullanici kaydi</summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = registerDto.Username,
                Email    = registerDto.Email,
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (result.Succeeded)
                return Ok(new { message = "Kayit basariyla tamamlandi." });

            foreach (var error in result.Errors)
                ModelState.AddModelError(string.Empty, error.Description);

            return BadRequest(ModelState);
        }

        /// <summary>Kullanici girisi; JWT token doner</summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized(new { message = "Gecersiz e-posta veya sifre." });

            var role        = user.Email == AdminEmail ? "Admin" : "User";
            var tokenString = GenerateJwtToken(user, role);

            return Ok(new
            {
                token    = tokenString,
                username = user.UserName,
                email    = user.Email,
                role,
                message  = "Giris basarili.",
            });
        }

        // ─── JWT Uretimi ───────────────────────────────────────────────────────────
        private string GenerateJwtToken(ApplicationUser user, string role)
        {
            var jwtKey      = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key eksik.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Role, role),
            };

            var token = new JwtSecurityToken(
                issuer:            _config["Jwt:Issuer"],
                audience:          _config["Jwt:Audience"],
                claims:            claims,
                expires:           DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
