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

        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFollow([FromBody] UserFollow follow)
        {
            var existing = await _context.UserFollows.FirstOrDefaultAsync(f => f.FollowerUsername == follow.FollowerUsername && f.FollowingUsername == follow.FollowingUsername);
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

        [HttpGet("stats/{username}")]
        public async Task<IActionResult> GetStats(string username)
        {
            var followers = await _context.UserFollows.CountAsync(f => f.FollowingUsername == username);
            var following = await _context.UserFollows.CountAsync(f => f.FollowerUsername == username);
            return Ok(new { followers, following });
        }

        [HttpGet("check")]
        public IActionResult CheckFollow(string follower, string followed)
        {
            var exists = _context.UserFollows.Any(f => f.FollowerUsername == follower && f.FollowingUsername == followed);
            return Ok(new { isFollowing = exists });
        }
    }
}