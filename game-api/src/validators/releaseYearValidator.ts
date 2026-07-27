export const releaseYearValidator = (operator: string, releaseYear: number, value: number): boolean => {
    switch (operator) {
        case "<":
            return releaseYear < value;
        case "<=":
            return releaseYear <= value;
        case ">":
            return releaseYear > value;
        case ">=":
            return releaseYear >= value;
        default:
            return false;
    }
};
