using System.ComponentModel.DataAnnotations;

namespace WebAppClients.Api.Models;

public class Booking
{
    public int Id { get; set; }

    [MaxLength(20)]
    public string? RoomId { get; set; }

    [MaxLength(50)]
    public string? RoomType { get; set; }

    [Required, MaxLength(150)]
    public string GuestName { get; set; } = string.Empty;

    [Required]
    public BookingStatus Status { get; set; }

    [Required]
    public double StartHour { get; set; }

    [Required]
    public double EndHour { get; set; }

    [Required]
    public DateOnly CheckInDate { get; set; }

    [Required]
    public DateOnly CheckOutDate { get; set; }
}
