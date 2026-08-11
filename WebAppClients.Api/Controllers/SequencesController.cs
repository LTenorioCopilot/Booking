using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAppClients.Api.Data;
using WebAppClients.Api.Models;

namespace WebAppClients.Api.Controllers;

[ApiController]
[Route("sequences")]
public class SequencesController(CustomersDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sequence>>> GetAll()
    {
        var sequences = await db.Sequences.AsNoTracking().OrderBy(s => s.Origin).ToListAsync();
        return Ok(sequences);
    }

    [HttpGet("preview")]
    public async Task<ActionResult> PreviewFolio([FromQuery] string origin)
    {
        var sequence = await db.Sequences.AsNoTracking().FirstOrDefaultAsync(s => s.Origin == origin);
        if (sequence is null) return NotFound();

        return Ok(new { folio = sequence.BuildFolio() });
    }
}
