using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MotoRota.Data;
using MotoRota.Models;

namespace MotoRota.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public RatingsController(ApplicationDbContext context) => _context = context;

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> RateTour(TourRating rating)
        {
            var existing = await _context.TourRatings.FirstOrDefaultAsync(r => r.TourId == rating.TourId && r.Username == rating.Username);
            if (existing != null) { existing.Score = rating.Score; }
            else { _context.TourRatings.Add(rating); }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("average/{tourId}")]
        public async Task<IActionResult> GetAverage(int tourId)
        {
            var ratings = await _context.TourRatings.Where(r => r.TourId == tourId).ToListAsync();
            if (!ratings.Any()) return Ok(new { average = 0.0, count = 0 });
            return Ok(new { average = ratings.Average(r => r.Score), count = ratings.Count });
        }
    }
}