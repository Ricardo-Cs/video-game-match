import type { CATEGORY_TYPES, CONDITION_OPERATORS } from "../schemas/gameSchemas";

export type CategoryType = typeof CATEGORY_TYPES[number];
export type ConditionOperator = typeof CONDITION_OPERATORS[number];

export interface Condition {
    field: string,
    operator: ConditionOperator,
    value: string | number;
};

export interface Category {
    name: string,
    type: CategoryType,
    condition: Condition
};

export interface CategoriesData {
    categories: Category[]
};

export interface answerData {
    id: number,
    categories: Category[]
}

export interface GameSearchResponse {
    id: number,
    first_release_date?: number,
    name: string,
    game_type: number
};

// DTO devolvido ao cliente pela rota de busca
export interface GameSearchResult {
    id: number,
    name: string,
    release_year?: number
}

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


export interface checkAnswerType {
    answer: boolean,
    image?: string | null
    message?: string
}