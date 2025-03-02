export const genreValidator = (apiResponseGenres: string[] | undefined, answerGenre: string): boolean => {
    return apiResponseGenres?.includes(answerGenre) ? true : false;
};