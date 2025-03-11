export interface Condition {
    field: string,
    operator: string,
    value: string | number;
};

export interface Category {
    name: string,
    type: string,
    condition: Condition
};

export interface CategoriesData {
    categories: Category[]
};

export interface answerData {
    id: string,
    categories: Category[]
}

export interface GameSearchResponse {
    id: number,
    first_release_date: number,
    name: string,
    game_type: number
};

export interface GameCheckApiResponse {
    id: number,
    name: string,
    first_release_date: number,
    genres: {
        id: number,
        name: string
    }[],
    platforms: {
        id: number,
        name: string
    }[],
    cover: {
        id: number,
        url: string
    },
    dlcs?: {
        id: number
    }[] | null,
    involved_companies: {
        id: number,
        company: {
            id: number,
            name: string
        }
    }[] | null,
    player_perspectives?: {
        id: number,
        name: string
    }[]
}


export interface checkAnswerType {
    answer: boolean,
    image: string | null
}