using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MotoRota.Data;
using MotoRota.Models;

namespace MotoRota.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RouteStopsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public RouteStopsController(ApplicationDbContext context) => _context = context;

        [AllowAnonymous]
        [HttpGet("{tourId}")]
        public async Task<ActionResult<IEnumerable<RouteStop>>> GetStops(int tourId)
            => await _context.RouteStops.Where(r => r.TourId == tourId).OrderBy(r => r.OrderIndex).ToListAsync();

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddStop(RouteStop stop)
        {
            _context.RouteStops.Add(stop);
            await _context.SaveChangesAsync();
            return Ok(stop);
        }
    }
}