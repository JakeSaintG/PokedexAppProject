using SqliteDbBuilder.Models;
using SqliteDbBuilder.Data;

namespace SqliteDbBuilder.Services;

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
        
        // if (_dataConfig.JsonStoreEnabled) JsonData.EnsureDataExists();
        // if (_dataConfig.SqliteEnabled) SqliteData.EnsureDataExists();
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
