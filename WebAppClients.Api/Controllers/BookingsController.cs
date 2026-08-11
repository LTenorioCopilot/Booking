using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAppClients.Api.Data;
using WebAppClients.Api.Models;

namespace WebAppClients.Api.Controllers;

[ApiController]
[Route("bookings")]
public class BookingsController(CustomersDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetAll()
    {
        var bookings = await db.Bookings.AsNoTracking().OrderBy(b => b.Id).ToListAsync();
        return Ok(bookings);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Booking>> GetById(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        return booking is null ? NotFound() : Ok(booking);
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> Create(Booking booking)
    {
        booking.Folio = await AsignarFolioAsync(booking.ReservationSource);
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Booking booking)
    {
        var existente = await db.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);
        if (existente is null) return NotFound();

        booking.Id = id;
        booking.Folio = existente.Folio;
        db.Entry(booking).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return Ok(booking);
    }

    private async Task<string?> AsignarFolioAsync(string origin)
    {
        if (string.IsNullOrWhiteSpace(origin)) return null;

        await using var transaction = await db.Database.BeginTransactionAsync();

        var sequence = await db.Sequences
            .FromSqlInterpolated($"SELECT * FROM Sequences WITH (UPDLOCK, ROWLOCK) WHERE Origin = {origin}")
            .SingleOrDefaultAsync();
        if (sequence is null) return null;

        var folio = sequence.BuildFolio();
        sequence.NextValue++;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return folio;
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var booking = await db.Bookings.FindAsync(id);
        if (booking is null) return NotFound();

        db.Bookings.Remove(booking);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
