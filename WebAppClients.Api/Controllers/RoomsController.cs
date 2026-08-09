using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAppClients.Api.Data;
using WebAppClients.Api.Models;

namespace WebAppClients.Api.Controllers;

[ApiController]
[Route("rooms")]
public class RoomsController(CustomersDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Room>>> GetAll()
    {
        var rooms = await db.Rooms.AsNoTracking().OrderBy(r => r.Id).ToListAsync();
        return Ok(rooms);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Room>> GetById(string id)
    {
        var room = await db.Rooms.FindAsync(id);
        return room is null ? NotFound() : Ok(room);
    }

    [HttpPost]
    public async Task<ActionResult<Room>> Create(Room room)
    {
        db.Rooms.Add(room);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Room room)
    {
        var existe = await db.Rooms.AnyAsync(r => r.Id == id);
        if (!existe) return NotFound();

        room.Id = id;
        db.Entry(room).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return Ok(room);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var room = await db.Rooms.FindAsync(id);
        if (room is null) return NotFound();

        db.Rooms.Remove(room);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
