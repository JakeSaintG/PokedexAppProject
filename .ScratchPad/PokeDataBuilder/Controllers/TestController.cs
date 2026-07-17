using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;
using System.Net;

namespace PokeDataBuilder.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
public class TestController : ControllerBase
{
    public TestController(){}

    [HttpGet]
    [SwaggerOperation("Get a list of all tenants")]
    // [SwaggerResponse(200, "Request successful", typeof(ResponseMessage<PagedResult<TenantViewModel>>))]
    public async Task<IActionResult> GetTest()
    {
        return Ok("User registered successfully.");
    }

    // [HttpGet]
    // [SwaggerOperation("Get a list of all tenants")]
    // // [SwaggerResponse(200, "Request successful", typeof(ResponseMessage<PagedResult<TenantViewModel>>))]
    // public async Task<IActionResult> GetTest()
    // {
    //     return new { Temperature = "25°C", Condition = "Sunny" };
    // }
}
