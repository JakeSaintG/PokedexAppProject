// See https://aka.ms/new-console-template for more information
using SqliteDbBuilder.Models;
using SqliteDbBuilder.Services;

var config = new DataConfig
{
    SqliteEnabled = true,
    JsonStoreEnabled = true
};

var dataSrv = new DataService(config);
