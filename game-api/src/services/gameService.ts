import { getGameById, searchGames } from "../integrations/igdb";
import { getCategoriesData } from "../repositories/categoriesRepository";
import { createCategories } from "../utils/createCategories";
import { answerData, GameSearchResult } from "../types/types";
import { checkAnswer } from "../validators";
import { AppError } from "../errors/AppError";

export const createCategoriesService = () => {
    const categoriesData = getCategoriesData();
    return createCategories(categoriesData);
};

export const gameSearchService = async (search: string): Promise<GameSearchResult[]> => {
    const games = await searchGames(search);

    return games.map((game) => ({
        id: game.id,
        name: game.name,
        release_year: game.first_release_date
            ? new Date(game.first_release_date * 1000).getFullYear()
            : undefined,
    }));
};

export const verifyAnswerService = async (data: answerData) => {
    const game = await getGameById(data.id);

    if (!game) {
        throw new AppError("Jogo não encontrado.", 404);
    }

    return checkAnswer(game, data);
};
