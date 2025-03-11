import { Category } from "../types/types";

export const releaseYearValidator = (operator: string, releaseYear: number, category: Category): boolean => {
    if (operator === "<=")
        return releaseYear <= Number(category.condition.value) ? true : false
    else if (operator === ">=")
        return releaseYear >= Number(category.condition.value) ? true : false
    return false;
};