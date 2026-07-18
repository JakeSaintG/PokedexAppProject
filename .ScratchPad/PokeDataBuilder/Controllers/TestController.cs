using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;
using System.Net;

namespace PokeDataBuilder.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
public class SqliteFilerBuilderController : ControllerBase
{
    public SqliteFilerBuilderController(){}

    [HttpGet]
    [SwaggerOperation("Trigger build of SQLite file.")]
    // [SwaggerResponse(200, "Request successful", typeof(ResponseMessage<PagedResult<TenantViewModel>>))]
    public async Task<IActionResult> GetTest()
    {
        return Ok("Building SQLite file as configured");
    }

    [HttpGet("with-options")]
    [SwaggerOperation("Trigger build of SQLite file with options.")]
    // [SwaggerResponse(200, "Request successful", typeof(ResponseMessage<PagedResult<TenantViewModel>>))]
    public async Task<IActionResult> GetTestButReturnSomething()
    {
        return Ok("Building SQLite file as with options");
    }
}
