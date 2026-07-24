namespace PokeDataBuilder.Services;

public class FileService : IFileService
{
    // private DataConfig _dataConfig {get; set;}
    private readonly string fileStorePath = "./files";

    public FileService()
    {
        EnsureFileDirectoryExists();
        EnsureLogsDirectoryExists();
    }

    protected void EnsureFileDirectoryExists()
    {
        if (!Directory.Exists($"{fileStorePath}/logs"))
        {
            Console.WriteLine("Creating file directory...");
            Directory.CreateDirectory($"{fileStorePath}/logs");
        }
    }

    protected void EnsureLogsDirectoryExists()
    {
        if (!Directory.Exists($"{fileStorePath}/logs"))
        {
            Console.WriteLine("Creating file directory...");
            Directory.CreateDirectory($"{fileStorePath}/logs");
        }
    }

    public string CreateNewTextFile(string fileName, string directory)
    {
        return $"directory/{fileName}.txt";
    }
}
