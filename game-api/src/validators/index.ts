import { answerData, checkAnswerType, GameCheckApiResponse } from "../types/types";
import { awardValidator } from "./awardValidator";
import { companyValidator } from "./developersValidator";
import { genreValidator } from "./genreValidator";
import { platformValidator } from "./platformValidator";
import { releaseYearValidator } from "./releaseYearValidator";

export const checkAnswer = async (apiResponse: GameCheckApiResponse, data: answerData): Promise<checkAnswerType> => {
    // Usa Promise.all para aguardar a conclusão de todas as operações assíncronas antes de continuar
    const response: boolean[] = await Promise.all(data.categories.map(async category => {
        switch (category.type) {
            case "genre": {
                const genresNames = apiResponse.genres.map(genre => genre.name);
                return genreValidator(genresNames, category.condition.value as string);
            }
            case "releaseYear": {
                const operator = category.condition.operator;
                const releaseYear = new Date(apiResponse.first_release_date * 1000).getFullYear();
                return releaseYearValidator(operator, releaseYear, category);
            }
            case "developers": {
                const companies = apiResponse.involved_companies?.map(company => company.company.name);
                return companyValidator(companies, category.condition.value as string);
            }
            case "platform": {
                const platforms = apiResponse.platforms.map(platform => platform.name);
                return platformValidator(platforms, category.condition.value as string);
            }
            case "award": {
                return await awardValidator(apiResponse.name, category.condition.value as string);
            }
            case "gameMode": {

            }
            case "dlcs": {

            }
            default:
                return false;
        }
    }));

    if (response.every(condition => condition === true))
        return { answer: true, image: apiResponse.cover.url };
    return { answer: false, message: "Resposta incorreta!" };
};
