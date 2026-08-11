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

    public DateOnly? DateOfBirth { get; set; }

    [MaxLength(100)]
    public string? Nationality { get; set; }

    [MaxLength(30)]
    public string? IdDocumentType { get; set; }

    [MaxLength(50)]
    public string? IdDocumentNumber { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [EmailAddress, MaxLength(150)]
    public string? Email { get; set; }

    [Required]
    public int AdultsCount { get; set; } = 1;

    [Required]
    public int MinorsCount { get; set; } = 0;

    [MaxLength(50)]
    public string? TravelPurpose { get; set; }

    [Required, MaxLength(20)]
    public string ReservationSource { get; set; } = "Otro";

    [MaxLength(20)]
    public string? Folio { get; set; }

    public int? CustomerId { get; set; }
}
