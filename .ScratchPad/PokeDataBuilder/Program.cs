// See https://aka.ms/new-console-template for more information
// using PokeDataBuilder.Models;
using PokeDataBuilder.Services;
using PokeDataBuilder.Controllers;

var fileSrv = new FileService();
var jsonSrv = new JsonService();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();




app.MapGet("/weather", () =>
{
    return new { Temperature = "25°C", Condition = "Sunny" };
})
.WithName("GetWeather")
.WithOpenApi();





app.UseSwagger();
app.UseStaticFiles();
app.UseSwaggerUI(options =>
{
    options.DocumentTitle = "PokeData Builder";
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    options.InjectStylesheet("/swagger/custom.css");
});

app.Run();
