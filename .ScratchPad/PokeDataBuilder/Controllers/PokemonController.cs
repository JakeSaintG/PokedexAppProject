using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;
using System.Net;
using PokeDataBuilder.Services;

namespace PokeDataBuilder.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
public class PokemonController : ControllerBase
{
    // TODO: Primary constructor?
    // PokemonService _pokeSrv = pokeSrv;
    
    PokemonService _pokeSrv;
    
    public PokemonController(PokemonService pokeSrv)
    {
        _pokeSrv = pokeSrv;
    }

    [HttpPost]
    [SwaggerOperation("Trigger synchronization of Pokemon data with PokeAPI")]
    [SwaggerResponse(200, "Request successful", typeof(Task<IActionResult>))]
    public async Task<IActionResult> PostPokemon(int id)
    {
        string foo;

        foo = _pokeSrv.TriggerPokeApiDownload(id);

        return Ok(foo);
    }

    [HttpGet]
    [SwaggerOperation("Retrieve information about PokeAPI synchronization status.")]
    [SwaggerResponse(200, "Request successful", typeof(Task<IActionResult>))]
    public async Task<IActionResult> GetPokemon()
    {
        var resp = _pokeSrv.HandleSynchronizationInfoRequest();
        return Ok(resp);
    }
}