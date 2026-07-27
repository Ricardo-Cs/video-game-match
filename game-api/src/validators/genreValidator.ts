export const genreValidator = (apiResponseGenres: string[] | undefined, answerGenre: string): boolean =>
    apiResponseGenres?.includes(answerGenre) ?? false;
