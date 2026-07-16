using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace PokeDataBuilder.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
public class TestController : ITestController
{
    
}
