namespace PokeDataBuilder.Services;

public class LogService : ILogService
{
    
    
    FileService _fileService;

    public LogService(FileService fileService)
    {
        _fileService = fileService;
    }

    public void LogToFile()
    {
        NewLogFile();
        Console.WriteLine("test");
    }

    private void NewLogFile()
    {
        string test = _fileService.CreateNewTextFile("directory", "fileName");
    }
}