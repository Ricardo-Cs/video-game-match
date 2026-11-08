import { AppError } from "../errors/AppError";
import { getGameById } from "../integrations/igdb";
import { findFreshCachedGame, saveCachedGame } from "../repositories/gameCacheRepository";
import { GameCheckApiResponse } from "../types/types";

const GAME_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const findGameById = async (gameId: number): Promise<GameCheckApiResponse> => {
    const cachedGame = await findFreshCachedGame(gameId);
    if (cachedGame) return cachedGame;

    const game = await getGameById(gameId);
    if (!game) throw new AppError("Jogo não encontrado.", 404);

    await saveCachedGame(game, new Date(Date.now() + GAME_CACHE_TTL_MS));
    return game;
};
