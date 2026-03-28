namespace MotoRota.Models
{
    public class Motorcycle
    {
        public int Id { get; set; }
        public string OwnerUsername { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }
        public int EngineCc { get; set; }
        public string ImageUrl { get; set; }
    }
}