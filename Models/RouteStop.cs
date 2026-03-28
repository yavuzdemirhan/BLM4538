namespace MotoRota.Models
{
    public class RouteStop
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public string StopName { get; set; }
        public string Description { get; set; }
        public int OrderIndex { get; set; }
        public string Time { get; set; }
    }
}