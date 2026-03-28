using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MotoRota.Models
{
    public class Tour
    {
        public int Id { get; set; }
        public string Baslik { get; set; }
        public string Aciklama { get; set; }
        public string Rota { get; set; }
        public DateTime Tarih { get; set; }
        public string MotosikletKategorisi { get; set; }
        public string OlusturanKisi { get; set; }
        public int ViewCount { get; set; } = 0;
        public string? CustomImageUrl { get; set; }

        [NotMapped]
        public double AverageRating { get; set; } = 0.0;
    }
}