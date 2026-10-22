// Tipos internos da API. O que trafega entre API e web mora em @vgm/contracts.
import type { Category } from "@vgm/contracts";

export interface CategoriesData {
    categories: Category[]
};

export interface GameSearchResponse {
    id: number,
    first_release_date?: number,
    name: string,
    game_type: number
};

export interface GameCheckApiResponse {
    id: number,
    name: string,
    // A IGDB omite campos vazios, então tudo além de id/name pode faltar
    first_release_date?: number,
    genres?: {
        id: number,
        name: string
    }[],
    platforms?: {
        id: number,
        name: string
    }[],
    cover?: {
        id: number,
        url: string
    },
    dlcs?: {
        id: number
    }[] | null,
    involved_companies?: {
        id: number,
        company: {
            id: number,
            name: string
        }
    }[] | null,
    player_perspectives?: {
        id: number,
        name: string
    }[],
    game_modes?: {
        id: number,
        name: string
    }[]
}
