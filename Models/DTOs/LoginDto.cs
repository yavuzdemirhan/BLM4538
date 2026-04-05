using System.ComponentModel.DataAnnotations;

namespace MotoRota.Models.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "E-posta alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Şifre alanı zorunludur")]
        public string Password { get; set; }
    }
}