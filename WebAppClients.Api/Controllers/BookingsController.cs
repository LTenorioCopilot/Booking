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
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Booking booking)
    {
        var existe = await db.Bookings.AnyAsync(b => b.Id == id);
        if (!existe) return NotFound();

        booking.Id = id;
        db.Entry(booking).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return Ok(booking);
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
