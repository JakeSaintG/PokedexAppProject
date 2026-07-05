namespace SqliteDbBuilder.Data;

public class SqliteData : IData
{
    public static void EnsureDataExists()
    {
        Console.WriteLine("Ensuring sqlite file is in place...");
    }
}
