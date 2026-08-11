using System.ComponentModel.DataAnnotations;

namespace WebAppClients.Api.Models;

public class Customer
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nombres { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Apellidos { get; set; } = string.Empty;

    [Required]
    public DocumentType DocumentType { get; set; }

    [Required, MaxLength(20)]
    public string NumeroDocumento { get; set; } = string.Empty;

    [Required]
    public DateOnly FechaNacimiento { get; set; }

    [MaxLength(100)]
    public string? Nationality { get; set; }

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Telefono { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Direccion { get; set; } = string.Empty;
}
