using System;

namespace MotoRota.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;
    }
}
