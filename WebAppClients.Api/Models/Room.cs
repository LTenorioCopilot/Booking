using System.ComponentModel.DataAnnotations;

namespace WebAppClients.Api.Models;

public class Room
{
    [Required, MaxLength(20)]
    public string Id { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    public int Capacity { get; set; }
}
