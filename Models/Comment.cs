using System;

namespace MotoRota.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int TourId { get; set; }
        public string Username { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsApproved { get; set; } = false;
    }
}