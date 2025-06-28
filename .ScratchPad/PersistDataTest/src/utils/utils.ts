import { Pokemon } from "../types/pokemon";

export const batchArray = (array: Pokemon[], batchSize: number) => {
    return Array.from(
        { length: Math.ceil(array.length / batchSize) },
        (_, index) => array.slice(index * batchSize, (index + 1) * batchSize)   
    );
}
