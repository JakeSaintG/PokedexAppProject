using SqliteDbBuilder.Models;
using SqliteDbBuilder.Data;

namespace SqliteDbBuilder.Services;

public class DataService
{
    private DataConfig _dataConfig {get; set;}
    private readonly String fileStorePath = "./files";

    public DataService(DataConfig dataConfig)
    {
        _dataConfig = dataConfig;
        EnsureDataStoreExists();
    }

    private void EnsureDataStoreExists()
    {
        if (!_dataConfig.JsonStoreEnabled || !_dataConfig.SqliteEnabled)
        {
            Console.WriteLine("No data store configured. Exiting...");
            return;
        }

        EnsureFileDirectoryExists();
        
        if (_dataConfig.JsonStoreEnabled) JsonData.EnsureDataExists();
        if (_dataConfig.SqliteEnabled) SqliteData.EnsureDataExists();
    }

    private void EnsureFileDirectoryExists()
    {
        if(!Directory.Exists(fileStorePath))
        {
            Console.WriteLine("Creating file directory...");
            Directory.CreateDirectory(fileStorePath);
        }
    }
}
