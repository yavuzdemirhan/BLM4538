using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MotoRota.Data;
using MotoRota.Models;

namespace MotoRota.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GarageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public GarageController(ApplicationDbContext context) => _context = context;

        [HttpGet("{username}")]
        public async Task<ActionResult<IEnumerable<Motorcycle>>> GetMyBikes(string username) => await _context.Motorcycles.Where(m => m.OwnerUsername == username).ToListAsync();

        [HttpPost]
        public async Task<IActionResult> AddBike(Motorcycle bike)
        {
            _context.Motorcycles.Add(bike);
            await _context.SaveChangesAsync();
            return Ok(bike);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBike(int id)
        {
            var bike = await _context.Motorcycles.FindAsync(id);
            if (bike == null) return NotFound();
            _context.Motorcycles.Remove(bike);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}