using System;

namespace MotoRota.Models
{
    public class Participation
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public string Username { get; set; }
        public string TourTitle { get; set; }
        public DateTime JoinDate { get; set; } = DateTime.Now;
    }
}