export type Condition = {
    field: string;
    operator: string;
    value: string | number;
};

export type Category = {
    name: string;
    type: string;
    condition: Condition;
};

export type CategoriesData = {
    categories: Category[];
};

export type answerData = {
    guid: string,
    categories: Category[]
}

export interface GameSearchResponse {
    id: number,
    first_release_date: number,
    name: string,
    game_type: number
};

export type checkAnswerType = {
    answer: boolean,
    image: string | null
}