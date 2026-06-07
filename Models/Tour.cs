using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MotoRota.Models
{
    public class Tour
    {
        public int Id { get; set; }
        public required string Baslik { get; set; }
        public required string Aciklama { get; set; }
        public required string Rota { get; set; }
        public DateTime Tarih { get; set; }
        public required string MotosikletKategorisi { get; set; }
        public required string OlusturanKisi { get; set; }
        public int ViewCount { get; set; } = 0;
        public string? CustomImageUrl { get; set; }

        [NotMapped]
        public double AverageRating { get; set; } = 0.0;
    }
}
