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
    public class EmergencyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public EmergencyController(ApplicationDbContext context) => _context = context;

        [HttpGet("{username}")]
        public async Task<ActionResult<EmergencyInfo>> GetInfo(string username)
        {
            var info = await _context.EmergencyInfos.FirstOrDefaultAsync(e => e.Username == username);
            if (info == null) return NotFound();
            return info;
        }

        [HttpPost]
        public async Task<IActionResult> SaveInfo(EmergencyInfo info)
        {
            var existing = await _context.EmergencyInfos.FirstOrDefaultAsync(e => e.Username == info.Username);
            if (existing != null)
            {
                existing.BloodType = info.BloodType;
                existing.EmergencyContactName = info.EmergencyContactName;
                existing.EmergencyContactPhone = info.EmergencyContactPhone;
                existing.Notes = info.Notes;
            }
            else { _context.EmergencyInfos.Add(info); }

            await _context.SaveChangesAsync();
            return Ok(info);
        }
    }
}