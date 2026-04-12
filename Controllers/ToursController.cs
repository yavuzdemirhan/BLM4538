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

        [AllowAnonymous] // Herkes turları görebilir
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tour>>> GetTours()
        {
            var tours = await _context.Tours.ToListAsync();
            foreach (var tour in tours)
            {
                var ratings = await _context.TourRatings.Where(r => r.TourId == tour.Id).ToListAsync();
                if (ratings.Any()) tour.AverageRating = ratings.Average(r => r.Score);
            }
            return tours;
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Tour>> GetTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null) return NotFound("Böyle bir tur bulunamadı.");
            return tour;
        }

        [Authorize] // Sadece giriş yapanlar tur ekleyebilir
        [HttpPost]
        public async Task<ActionResult<Tour>> PostTour(Tour tour)
        {
            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetTour", new { id = tour.Id }, tour);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null) return NotFound();
            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();
            return NoContent();
        }

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