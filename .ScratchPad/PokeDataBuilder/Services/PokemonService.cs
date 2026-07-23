namespace PokeDataBuilder.Services;

// TODO: Need to offload a lot of duplicate logic. Still whiteboarding.

public class PokemonService : IPokemonService
{
    
    public string CurrentSynchronization { get; set; }

    public PokemonService()
    {
        CurrentSynchronization = "none";
    }

    public string TriggerPokeApiDownload(int id)
    {
        if (id == 0)
        {
            Console.WriteLine("Triggering generation sync with PokeAPI");
            return "syncing ";
        }
        
        // TODO: Return error/warning if sync is already happening
        Console.WriteLine($"Triggering generation {id} sync with PokeAPI");
        return $"syncing {id}";
    }

    public string HandleSynchronizationInfoRequest()
    {
        if (CurrentSynchronization == "none")
        {
            return "Synchronization last completed:______";
        }
        else
        {
            return "Synchronization with id _____ started at _______ and been running for ________ seconds";
        }
    }

    public string HandleSynchronizationInfoRequest(int id)
    {
        if (CurrentSynchronization == "none")
        {
            return "Synchronization last completed:______";
        }
        else
        {
            return "Synchronization with id _____ started at _______ and been running for ________ seconds";
        }
    }
}