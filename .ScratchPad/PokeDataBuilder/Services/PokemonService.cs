namespace PokeDataBuilder.Services;

// TODO: Need to offload a lot of duplicate logic. Still whiteboarding.

public class PokemonService
{
    
    public string CurrentSynchronization { get; set; }

    public PokemonService()
    {
        CurrentSynchronization = "none";
    }

    public string TriggerPokeApiDownload()
    {
        // TODO: Return error/warning if sync is already happening
        Console.WriteLine("Triggering sync with PokeAPI");
        return "syncing";
    }

    public string TriggerPokeApiDownload(int id)
    {
        // TODO: Return error/warning if sync is already happening
        Console.WriteLine($"Triggering generation {id} sync with PokeAPI");
        return $"syncing {id}";
    }

    public string handleSynchronizationInfoRequest()
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

    public string handleSynchronizationInfoRequest(int id)
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