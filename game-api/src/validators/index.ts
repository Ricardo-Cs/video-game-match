import { answerData, checkAnswerType, GameSearchResponse } from "../types/types";
import { genreValidator } from "./genreValidator";
import { releaseYearValidator } from "./releaseYearValidator";

export const checkAnswer = (apiResponse: GameSearchResponse, data: answerData): checkAnswerType => {
    const response: boolean[] = [];

    data.categories.forEach(category => {

        switch (category.type) {

            case "genre":
                const genreNames = apiResponse.data.results.genres?.map(genre => genre.name);
                response.push(genreValidator(genreNames, category.condition.value as string));
                break;
            case "releaseYear":
                const operator = category.condition.operator;
                const releaseYear = apiResponse.data.results.original_release_date?.split("-")[0] as string;
                response.push(releaseYearValidator(operator, releaseYear, category));
                break;
            case "developers":
                break;
            case "platform":
                break;
        }
    });

    return { answer: response.every(condition => condition === true), image: null }
};