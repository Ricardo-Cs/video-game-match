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

// O jogo só como a grade exibe: o resto é conferido direto na IGDB pelos filtros
export interface GameSummary {
    id: number,
    name: string,
    // A IGDB omite campos vazios
    cover?: {
        id: number,
        url: string
    },
}
