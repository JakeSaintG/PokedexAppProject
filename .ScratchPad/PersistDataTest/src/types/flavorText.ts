import { Language } from "./language"
import { Version } from "./version"

export interface FlavorTextEntry {
    flavor_text: string,
    language: Language
    version: Version
}
