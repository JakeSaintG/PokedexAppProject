// using PokeDataBuilder.Models;

namespace PokeDataBuilder.Services;

public class DataService : IDataService
{

    protected readonly string fileStorePath = "./files";

    public DataService()
    {
        EnsureDataStoreExists();
    }

    private void EnsureDataStoreExists()
    {
        // if (!_dataConfig.JsonStoreEnabled || !_dataConfig.SqliteEnabled)
        // {
        //     Console.WriteLine("No data store configured. Exiting...");
        //     return;
        // }

        EnsureFileDirectoryExists();
    }

    private void EnsureFileDirectoryExists()
    {
        if(!Directory.Exists(fileStorePath))
        {
            Console.WriteLine("Creating file directory...");
            Directory.CreateDirectory(fileStorePath);
        }
    }

    public virtual void EnsureFileExists(){}
}
