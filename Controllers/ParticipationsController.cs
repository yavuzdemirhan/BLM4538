using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MotoRota.Data;
using MotoRota.Models;

namespace MotoRota.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ParticipationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ParticipationsController(ApplicationDbContext context) => _context = context;

        /// <summary>Tura katıl</summary>
        [HttpPost]
        public async Task<IActionResult> JoinTour([FromBody] Participation participation)
        {
            var exists = await _context.Participations
                .AnyAsync(p => p.TourId == participation.TourId && p.Username == participation.Username);

            if (exists) return BadRequest(new { message = "Zaten bu tura katıldınız." });

            _context.Participations.Add(participation);

            // Tura katılım durumunda tur sahibine bildirim oluştur
            var tour = await _context.Tours.FindAsync(participation.TourId);
            if (tour != null && tour.OlusturanKisi != participation.Username)
            {
                var notification = new Notification
                {
                    Username = tour.OlusturanKisi,
                    Message = $"{participation.Username} adlı sürücü '{tour.Baslik}' turunuza katıldı!",
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Kayıt başarılı!" });
        }

        /// <summary>Kullanıcının katıldığı turlar (puanlar dahil)</summary>
        [HttpGet("{username}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetMyParticipations(string username)
        {
            var joinedTours = await _context.Participations
                .Where(p => p.Username == username)
                .Join(_context.Tours, p => p.TourId, t => t.Id, (p, t) => t)
                .ToListAsync();

            // Tüm rating'leri tek sorguda çek (N+1 önlemi)
            var tourIds = joinedTours.Select(t => t.Id).ToList();
            var allRatings = await _context.TourRatings
                .Where(r => tourIds.Contains(r.TourId))
                .ToListAsync();

            var ratingsByTour = allRatings
                .GroupBy(r => r.TourId)
                .ToDictionary(g => g.Key, g => g.Average(r => r.Score));

            foreach (var tour in joinedTours)
            {
                if (ratingsByTour.TryGetValue(tour.Id, out var avg))
                    tour.AverageRating = avg;
            }

            return joinedTours;
        }

        /// <summary>Turdan ayrıl</summary>
        [HttpDelete("leave")]
        public async Task<IActionResult> LeaveTour([FromQuery] int tourId, [FromQuery] string username)
        {
            var participation = await _context.Participations
                .FirstOrDefaultAsync(p => p.TourId == tourId && p.Username == username);

            if (participation == null)
                return NotFound(new { message = "Bu tura zaten katılmamışsınız." });

            _context.Participations.Remove(participation);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Turdan ayrıldınız." });
        }

        /// <summary>Katılım durumunu kontrol et</summary>
        [HttpGet("check")]
        public async Task<IActionResult> CheckStatus([FromQuery] int tourId, [FromQuery] string username)
        {
            var exists = await _context.Participations
                .AnyAsync(p => p.TourId == tourId && p.Username == username);
            return Ok(new { isJoined = exists });
        }
    }
}