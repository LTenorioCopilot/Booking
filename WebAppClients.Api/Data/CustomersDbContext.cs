using Microsoft.EntityFrameworkCore;
using WebAppClients.Api.Models;

namespace WebAppClients.Api.Data;

public class CustomersDbContext(DbContextOptions<CustomersDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Room> Rooms => Set<Room>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.Property(c => c.DocumentType).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(c => c.NumeroDocumento).IsUnique();
            entity.HasIndex(c => c.Email).IsUnique();
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.ToTable("Rooms");
            entity.HasData(
                new Room { Id = "101", Name = "Habitación 101", Type = "Sencilla", Capacity = 2 },
                new Room { Id = "102", Name = "Habitación 102", Type = "Doble", Capacity = 4 },
                new Room { Id = "201", Name = "Suite 201", Type = "Suite Delux", Capacity = 3 },
                new Room { Id = "202", Name = "Suite 202", Type = "Suite Presidencial", Capacity = 5 }
            );
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("Booking");
            entity.Property(b => b.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(b => b.RoomId);
            entity.HasOne<Room>().WithMany().HasForeignKey(b => b.RoomId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
