namespace MotoRota.Models
{
    public class UserFollow
    {
        public int Id { get; set; }
        public string FollowerUsername { get; set; }
        public string FollowingUsername { get; set; }
    }
}