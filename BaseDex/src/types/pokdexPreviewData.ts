export interface PokedexPreviewData {
    name: string
    primary_type: string
    secondary_type: string | undefined
    dex_no: number
    id: number
    img_url: string
    is_registered: boolean
    img_data?: Blob
}