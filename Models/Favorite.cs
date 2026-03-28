namespace MotoRota.Models
{
    public class Favorite
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public string Username { get; set; }
        public string TourTitle { get; set; }
        public string TourImage { get; set; }
    }
}