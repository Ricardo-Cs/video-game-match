import { Category } from "../types/types";

export const releaseYearValidator = (operator: string, releaseYear: string, category: Category): boolean => {
    if (operator === "<=")
        return releaseYear <= category.condition.value ? true : false
    else if (operator === ">=")
        return releaseYear >= category.condition.value ? true : false
    return false;
};