export interface PokemonImageData {
    id: number
    name: string
    male_sprite: string | Blob
    female_sprite: string | Blob | null
}