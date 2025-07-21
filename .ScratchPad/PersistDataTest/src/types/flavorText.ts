import { Pokemon } from "./pokemon";

export interface FlavorTextEntry {
    flavor_text: string
    language: Language
    version: Version
}

interface Language {
    name: string;
    url: string;
}

interface Version extends Pokemon {
    name: string;
    url: string;
}
