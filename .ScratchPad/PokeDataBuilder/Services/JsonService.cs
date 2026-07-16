namespace PokeDataBuilder.Services;

public class JsonService : DataService
{
    // private DataConfig _dataConfig {get; set;}

    public JsonService()
    {
        EnsureFileExists();
    }

    public override void EnsureFileExists()
    {
        base.EnsureFileExists();
        Console.WriteLine($"Ensuring json file exists in {base.fileStorePath}...");
    }
}
