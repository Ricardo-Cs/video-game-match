import { answerData, checkAnswerType, GameCheckApiResponse } from "../types/types";
import { genreValidator } from "./genreValidator";
import { releaseYearValidator } from "./releaseYearValidator";

export const checkAnswer = (apiResponse: GameCheckApiResponse, data: answerData): checkAnswerType => {
    const response: boolean[] = [];

    data.categories.forEach(category => {
        switch (category.type) {
            case "genre":
                const genreNames = apiResponse.genres.map(genre => genre.name);
                console.log(genreNames)
                response.push(genreValidator(genreNames, category.condition.value as string));
                break;
            case "releaseYear":
                const operator = category.condition.operator;
                const releaseYear = new Date(apiResponse.first_release_date * 1000).getFullYear();
                response.push(releaseYearValidator(operator, releaseYear, category));
                break;
            case "developers":
                break;
            case "platform":
                break;
            case "award":
                break;
            case "":
                break;
            default:
                break;
        }
    });

    return { answer: response.every(condition => condition === true), image: apiResponse.cover.url }
};