namespace MotoRota.Models
{
    public class UserFollow
    {
        public int Id { get; set; }
        public required string FollowerUsername { get; set; }
        public required string FollowingUsername { get; set; }
    }
}
