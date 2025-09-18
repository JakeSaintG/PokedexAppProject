export interface PokemonImageData {
    id: number
    name: string
    default_sprite: string | Blob
    female_sprite: string | Blob | null
}