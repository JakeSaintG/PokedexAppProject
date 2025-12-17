export interface PokedexPreviewData {
    name: string
    primary_type: string
    dex_no: number
    id: number
    img_url: string
    is_registered: boolean
    img_data?: Blob
}