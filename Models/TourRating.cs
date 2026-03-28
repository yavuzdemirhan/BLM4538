namespace MotoRota.Models
{
    public class TourRating
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public string Username { get; set; }
        public int Score { get; set; }
    }
}