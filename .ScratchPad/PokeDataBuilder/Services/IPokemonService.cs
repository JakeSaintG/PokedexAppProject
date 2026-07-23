namespace PokeDataBuilder.Services;

public interface IPokemonService
{
    string TriggerPokeApiDownload(int id);

    string HandleSynchronizationInfoRequest();
    string HandleSynchronizationInfoRequest(int id);
}