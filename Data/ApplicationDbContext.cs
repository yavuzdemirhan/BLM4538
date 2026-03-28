using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MotoRota.Models; 

namespace MotoRota.Data
{
    //  Tabloları projeye dahil ediyoruz
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        //SQL Server:
        public DbSet<Tour> Tours { get; set; }
        public DbSet<Motorcycle> Motorcycles { get; set; }
        public DbSet<RouteStop> RouteStops { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Participation> Participations { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<TourRating> TourRatings { get; set; }
        public DbSet<UserFollow> UserFollows { get; set; }
        public DbSet<EmergencyInfo> EmergencyInfos { get; set; }
        public DbSet<Notification> Notifications { get; set; }
    }
}