import type { Category } from "@vgm/contracts";
import { AppError } from "../errors/AppError";
import { checkGameAgainstFilters, countGamesMatching, PLAYABLE_GAME_TYPES_FILTER } from "../integrations/igdb";
import { findAwardWinnerIds } from "../repositories/awardRepository";
import type { GameSummary } from "../types/types";
import type { CountAnswers } from "../utils/drawCategories";
import { buildCategoryFilter, buildFilterForAll, type CategoryFilterContext } from "../validators";

// O catálogo da IGDB muda devagar; um dia de cache evita repetir as mesmas
// contagens a cada rodada sorteada
const ANSWER_COUNT_TTL_MS = 24 * 60 * 60 * 1000;

const answerCountCache = new Map<string, { count: number; expiresAt: number }>();

export const clearAnswerCountCache = (): void => answerCountCache.clear();

// A ordem das categorias não muda a contagem: linha × coluna = coluna × linha
const cacheKeyOf = (group: readonly Category[]): string =>
    group
        .map(({ type, condition }) => JSON.stringify({ type, condition }))
        .sort()
        .join("&");

export const loadFilterContext = async (): Promise<CategoryFilterContext> => ({
    awardWinnerIds: await findAwardWinnerIds(),
});

export const createAnswerCounter = (context: CategoryFilterContext): CountAnswers => async (groups) => {
    const now = Date.now();
    const keys = groups.map(cacheKeyOf);
    const missingIndexes = keys.flatMap((key, index) =>
        (answerCountCache.get(key)?.expiresAt ?? 0) > now ? [] : [index],
    );

    const freshCounts = await countGamesMatching(
        missingIndexes.map((index) => `${buildFilterForAll(groups[index], context)} & ${PLAYABLE_GAME_TYPES_FILTER}`),
    );
    missingIndexes.forEach((groupIndex, position) => {
        answerCountCache.set(keys[groupIndex], { count: freshCounts[position], expiresAt: now + ANSWER_COUNT_TTL_MS });
    });

    return keys.map((key) => answerCountCache.get(key)!.count);
};

export interface GameCheckResult {
    game: GameSummary;
    unmetCategories: Category[];
}

export const checkGameAgainstCategories = async (
    gameId: number,
    categories: readonly Category[],
): Promise<GameCheckResult> => {
    const context = await loadFilterContext();
    const filters = categories.map((category) => buildCategoryFilter(category, context));
    const { game, matchesPerFilter } = await checkGameAgainstFilters(gameId, filters);

    if (!game) throw new AppError("Jogo não encontrado.", 404);

    return { game, unmetCategories: categories.filter((_category, index) => !matchesPerFilter[index]) };
};
