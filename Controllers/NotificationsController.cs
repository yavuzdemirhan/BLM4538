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
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public NotificationsController(ApplicationDbContext context) => _context = context;

        // Kullanıcının bildirimlerini getir
        [HttpGet("{username}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetMyNotifications(string username)
        {
            return await _context.Notifications
                .Where(n => n.Username == username)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // Bildirimi okundu olarak işaretle
        [HttpPost("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Bildirim okundu olarak işaretlendi." });
        }

        // Yeni bildirim gönder
        [HttpPost]
        public async Task<IActionResult> SendNotification([FromBody] Notification notification)
        {
            notification.CreatedAt = DateTime.Now;
            notification.IsRead = false;
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return Ok(notification);
        }
    }
}