using Microsoft.EntityFrameworkCore;
using WebAppClients.Api.Models;

namespace WebAppClients.Api.Data;

public class ClientesDbContext(DbContextOptions<ClientesDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.Property(c => c.TipoDocumento).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(c => c.NumeroDocumento).IsUnique();
            entity.HasIndex(c => c.Email).IsUnique();
        });
    }
}
