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

export type GameSearchResponse = {
    data: {
        results: {
            image?: {
                icon_url?: string;
                medium_url?: string;
            };
            original_release_date?: string;
            platforms?: {
                id: number;
                name: string;
                abbreviation: string;
            }[];
            developers?: {
                id: number;
                name: string;
            }[];
            genres?: {
                id: number;
                name: string;
            }[];
            dlcs?: {
                id: number;
                name: string;
            }[];
        };
    }
};
