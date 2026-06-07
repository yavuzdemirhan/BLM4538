namespace MotoRota.Models
{
    public class Motorcycle
    {
        public int Id { get; set; }
        public required string OwnerUsername { get; set; }
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public int Year { get; set; }
        public int EngineCc { get; set; }
        public string? ImageUrl { get; set; }
    }
}
