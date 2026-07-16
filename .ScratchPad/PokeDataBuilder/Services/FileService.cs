namespace PokeDataBuilder.Services;

public class FileService : DataService
{
    // private DataConfig _dataConfig {get; set;}

    public FileService()
    {
        EnsureFileExists();
    }

    public override void EnsureFileExists()
    {
        base.EnsureFileExists();
        Console.WriteLine($"Ensuring db file exists in {base.fileStorePath}...");
    }
}
