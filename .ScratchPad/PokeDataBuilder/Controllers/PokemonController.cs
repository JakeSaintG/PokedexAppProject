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
    public PokemonController(){}

    [HttpPost]
    [SwaggerOperation("Trigger synchronization of Pokemon data with PokeAPI")]
    [SwaggerResponse(200, "Request successful", typeof(Task<IActionResult>))]
    public async Task<IActionResult> PostPokemon(int id)
    {
        string foo;

        // TODO: Need to pull in to whole controller through dependency injection
        PokemonService pokeSrv = new PokemonService();

        if (id != 0)
        {
            foo = pokeSrv.TriggerPokeApiDownload(id);
        } else
        {
            foo = pokeSrv.TriggerPokeApiDownload();
        }

        return Ok(foo);
    }

    [HttpGet]
    [SwaggerOperation("Retrieve information about PokeAPI synchronization status.")]
    [SwaggerResponse(200, "Request successful", typeof(Task<IActionResult>))]
    public async Task<IActionResult> GetPokemon()
    {
        // TODO: Need to pull in to whole controller through dependency injection
        PokemonService pokeSrv = new PokemonService();
        var resp = pokeSrv.handleSynchronizationInfoRequest();
        return Ok(resp);
    }
}