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

        [AllowAnonymous]
        [HttpGet("{tourId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(int tourId)
        {
            return await _context.Comments
                                 .Where(c => c.TourId == tourId && c.IsApproved == true)
                                 .OrderByDescending(c => c.CreatedAt)
                                 .ToListAsync();
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Comment>> PostComment(Comment comment)
        {
            var exists = await _context.Comments.AnyAsync(c => c.TourId == comment.TourId && c.Username == comment.Username);
            if (exists) return BadRequest("Bu tura sadece 1 yorum yapabilirsiniz.");

            comment.IsApproved = false;
            comment.CreatedAt = DateTime.Now;
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Yorum admin onayına gönderildi.", data = comment });
        }

        [Authorize] // Admin rolleri eklendiğinde buraya [Authorize(Roles = "Admin")] yapılabilir
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetPending()
        {
            return await _context.Comments
                                 .Where(c => c.IsApproved == false)
                                 .OrderByDescending(c => c.CreatedAt)
                                 .ToListAsync();
        }

        [Authorize]
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound();
            comment.IsApproved = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Yorum onaylandı." });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound();
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Yorum silindi." });
        }
    }
}