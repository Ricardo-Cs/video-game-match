import { answerData, checkAnswerType, GameCheckApiResponse } from "../types/types";
import { awardValidator } from "./awardValidator";
import { companyValidator } from "./developersValidator";
import { dlcsValidator } from "./dlcsValidator";
import { gameModeValidator } from "./gameModeValidator";
import { genreValidator } from "./genreValidator";
import { platformValidator } from "./platformValidator";
import { releaseYearValidator } from "./releaseYearValidator";

export const checkAnswer = async (apiResponse: GameCheckApiResponse, data: answerData): Promise<checkAnswerType> => {
    // Aguarda todas as validações (algumas assíncronas, ex.: award consulta o banco)
    const results = await Promise.all(data.categories.map(async (category) => {
        const value = category.condition.value;

        switch (category.type) {
            case "genre":
                return genreValidator(apiResponse.genres?.map((genre) => genre.name), value as string);
            case "releaseYear": {
                if (!apiResponse.first_release_date) return false;
                const releaseYear = new Date(apiResponse.first_release_date * 1000).getFullYear();
                return releaseYearValidator(category.condition.operator, releaseYear, Number(value));
            }
            case "company":
                return companyValidator(apiResponse.involved_companies?.map((c) => c.company.name), value as string);
            case "platform":
                return platformValidator(apiResponse.platforms?.map((platform) => platform.name), value as string);
            case "award":
                return awardValidator(apiResponse.name, value as string);
            case "gameMode":
                return gameModeValidator(apiResponse.game_modes?.map((mode) => mode.name), value as string);
            case "dlcs":
                return dlcsValidator(apiResponse.dlcs);
            default:
                return false;
        }
    }));

    if (results.every((condition) => condition === true))
        return { answer: true, image: apiResponse.cover?.url ?? null };

    return { answer: false, message: "Resposta incorreta!" };
};
