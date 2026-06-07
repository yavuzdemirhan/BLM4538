using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MotoRota.Data;
using MotoRota.Models;

namespace MotoRota.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentsController(ApplicationDbContext context) => _context = context;

        /// <summary>Tura ait onaylanmış yorumları listele (public)</summary>
        [AllowAnonymous]
        [HttpGet("{tourId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(int tourId)
        {
            return await _context.Comments
                .Where(c => c.TourId == tourId && c.IsApproved == true)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        /// <summary>Yorum gönder (auth gerekli, tur başına 1 yorum). Admin yorumları direkt onaylanır.</summary>
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Comment>> PostComment(Comment comment)
        {
            var exists = await _context.Comments
                .AnyAsync(c => c.TourId == comment.TourId && c.Username == comment.Username);

            if (exists) return BadRequest(new { message = "Bu tura sadece 1 yorum yapabilirsiniz." });

            // Admin kullanıcısının yorumu direkt onaylı olarak kaydedilir (Çoklu korumalı kontrol)
            var isAdmin = User.IsInRole("Admin") || 
                          User.HasClaim(c => (c.Type == "role" || c.Type == System.Security.Claims.ClaimTypes.Role) && c.Value == "Admin") ||
                          User.HasClaim(c => (c.Type == System.Security.Claims.ClaimTypes.Email || c.Type == "email" || c.Type == "sub") && c.Value == "yselim_demirhan@hotmail.com");

            comment.IsApproved = isAdmin;
            comment.CreatedAt = DateTime.Now;
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var msg = isAdmin
                ? "Yorum başarıyla eklendi."
                : "Yorum admin onayına gönderildi.";

            return Ok(new { message = msg, data = comment });
        }

        /// <summary>Onay bekleyen yorumları listele (sadece Admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetPending()
        {
            return await _context.Comments
                .Where(c => c.IsApproved == false)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        /// <summary>Yorumu onayla (sadece Admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound(new { message = "Yorum bulunamadı." });

            comment.IsApproved = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Yorum onaylandı." });
        }

        /// <summary>Yorum sil (sadece Admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound(new { message = "Yorum bulunamadı." });

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Yorum silindi." });
        }
    }
}