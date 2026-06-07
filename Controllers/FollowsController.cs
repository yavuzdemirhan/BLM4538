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
    public class FollowsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FollowsController(ApplicationDbContext context) => _context = context;

        /// <summary>Takip et / takipten çık (toggle)</summary>
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFollow([FromBody] UserFollow follow)
        {
            var existing = await _context.UserFollows
                .FirstOrDefaultAsync(f =>
                    f.FollowerUsername == follow.FollowerUsername &&
                    f.FollowingUsername == follow.FollowingUsername);

            if (existing != null)
            {
                _context.UserFollows.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { status = "unfollowed" });
            }

            _context.UserFollows.Add(follow);
            await _context.SaveChangesAsync();
            return Ok(new { status = "followed" });
        }

        /// <summary>Takipçi ve takip edilen sayısı</summary>
        [HttpGet("stats/{username}")]
        public async Task<IActionResult> GetStats(string username)
        {
            var followers = await _context.UserFollows.CountAsync(f => f.FollowingUsername == username);
            var following = await _context.UserFollows.CountAsync(f => f.FollowerUsername == username);
            return Ok(new { followers, following });
        }

        /// <summary>Takip durumunu kontrol et</summary>
        [HttpGet("check")]
        public async Task<IActionResult> CheckFollow(string follower, string followed)
        {
            var exists = await _context.UserFollows
                .AnyAsync(f => f.FollowerUsername == follower && f.FollowingUsername == followed);
            return Ok(new { isFollowing = exists });
        }
    }
}