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
    public class FavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public FavoritesController(ApplicationDbContext context) => _context = context;

        [HttpPost]
        public async Task<IActionResult> ToggleFavorite([FromBody] Favorite fav)
        {
            var existing = await _context.Favorites.FirstOrDefaultAsync(f => f.Username == fav.Username && f.TourId == fav.TourId);

            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Favorilerden çıkarıldı", status = "removed" });
            }

            _context.Favorites.Add(fav);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Favorilere eklendi", status = "added" });
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<IEnumerable<Favorite>>> GetMyFavorites(string username)
        {
            return await _context.Favorites.Where(f => f.Username == username).ToListAsync();
        }
    }
}