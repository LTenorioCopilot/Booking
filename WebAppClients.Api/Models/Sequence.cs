using System.ComponentModel.DataAnnotations;

namespace WebAppClients.Api.Models;

public class Sequence
{
    [Key, MaxLength(30)]
    public string Origin { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string Prefix { get; set; } = string.Empty;

    [Required]
    public int NextValue { get; set; } = 1;

    [Required]
    public int PadLength { get; set; } = 6;

    public string BuildFolio() => Prefix + NextValue.ToString().PadLeft(PadLength, '0');
}
