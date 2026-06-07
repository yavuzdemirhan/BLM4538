using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MotoRota.Data;
using MotoRota.Models;

namespace MotoRota.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToursController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ToursController(ApplicationDbContext context) => _context = context;

        /// <summary>Tüm turları listele (public). Ortalama puanlar dahil döner.</summary>
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tour>>> GetTours()
        {
            var tours = await _context.Tours.ToListAsync();

            // Tüm rating'leri tek sorguda çek, bellekte eşleştir (N+1 önlemi)
            var allRatings = await _context.TourRatings.ToListAsync();
            var ratingsByTour = allRatings
                .GroupBy(r => r.TourId)
                .ToDictionary(g => g.Key, g => g.Average(r => r.Score));

            foreach (var tour in tours)
            {
                if (ratingsByTour.TryGetValue(tour.Id, out var avg))
                    tour.AverageRating = avg;
            }

            return tours;
        }

        /// <summary>Tek tur detayı (public). Görüntülenme sayısını artırır.</summary>
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Tour>> GetTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null) return NotFound(new { message = "Böyle bir tur bulunamadı." });

            // Görüntülenme sayısını artır
            tour.ViewCount++;
            await _context.SaveChangesAsync();

            // Ortalama puanı hesapla
            var ratings = await _context.TourRatings.Where(r => r.TourId == id).ToListAsync();
            if (ratings.Count > 0)
                tour.AverageRating = ratings.Average(r => r.Score);

            return tour;
        }

        /// <summary>Yeni tur oluştur (auth gerekli)</summary>
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Tour>> PostTour(Tour tour)
        {
            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTour), new { id = tour.Id }, tour);
        }

        /// <summary>Turu sil (auth gerekli, sadece tur sahibi veya admin)</summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null) return NotFound(new { message = "Tur bulunamadı." });

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>Kullanıcının oluşturduğu turlar</summary>
        [Authorize]
        [HttpGet("my-created/{username}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetMyCreatedTours(string username)
        {
            return await _context.Tours
                .Where(t => t.OlusturanKisi == username)
                .OrderByDescending(t => t.Tarih)
                .ToListAsync();
        }
    }
}