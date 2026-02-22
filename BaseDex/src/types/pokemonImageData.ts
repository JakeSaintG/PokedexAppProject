export interface PokemonImageData {
    id: number
    name: string
    default_sprite: string | Blob | Uint8Array<ArrayBufferLike>
    female_sprite?: string | Blob | Uint8Array<ArrayBufferLike> | null
    default_sprite_size: number
    female_sprite_size?: number | null
}