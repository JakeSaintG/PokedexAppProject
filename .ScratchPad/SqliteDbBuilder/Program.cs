// See https://aka.ms/new-console-template for more information
// using SqliteDbBuilder.Models;
using SqliteDbBuilder.Services;

var fileSrv = new FileService();
var jsonSrv = new JsonService();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapGet("/weather", () =>
{
    return new { Temperature = "25°C", Condition = "Sunny" };
})
.WithName("GetWeather")
.WithOpenApi();

app.UseSwagger();
app.UseSwaggerUI();

app.Run();
