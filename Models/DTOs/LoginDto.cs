using System.ComponentModel.DataAnnotations;

namespace MotoRota.Models.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "E-posta alani zorunludur")]
        [EmailAddress(ErrorMessage = "Gecerli bir e-posta adresi girin")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Sifre alani zorunludur")]
        public required string Password { get; set; }
    }
}
