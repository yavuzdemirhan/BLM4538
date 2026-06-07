using System.ComponentModel.DataAnnotations;

namespace MotoRota.Models.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Kullanici adi zorunludur")]
        public required string Username { get; set; }

        [Required(ErrorMessage = "E-posta alani zorunludur")]
        [EmailAddress(ErrorMessage = "Gecerli bir e-posta adresi girin")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Sifre alani zorunludur")]
        public required string Password { get; set; }
    }
}
