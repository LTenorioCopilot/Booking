using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAppClients.Api.Data;
using WebAppClients.Api.Models;

namespace WebAppClients.Api.Controllers;

[ApiController]
[Route("clientes")]
public class ClientesController(ClientesDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cliente>>> GetAll()
    {
        var clientes = await db.Clientes.AsNoTracking().OrderBy(c => c.Id).ToListAsync();
        return Ok(clientes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Cliente>> GetById(int id)
    {
        var cliente = await db.Clientes.FindAsync(id);
        return cliente is null ? NotFound() : Ok(cliente);
    }

    [HttpPost]
    public async Task<ActionResult<Cliente>> Create(Cliente cliente)
    {
        db.Clientes.Add(cliente);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Cliente cliente)
    {
        var existe = await db.Clientes.AnyAsync(c => c.Id == id);
        if (!existe) return NotFound();

        cliente.Id = id;
        db.Entry(cliente).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return Ok(cliente);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cliente = await db.Clientes.FindAsync(id);
        if (cliente is null) return NotFound();

        db.Clientes.Remove(cliente);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
