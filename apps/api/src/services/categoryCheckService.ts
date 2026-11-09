import type { Category } from "@vgm/contracts";
import { AppError } from "../errors/AppError";
import { checkGameAgainstFilters, countGamesMatching, PLAYABLE_GAME_TYPES_FILTER } from "../integrations/igdb";
import { findAwardWinnerIds } from "../repositories/awardRepository";
import type { GameSummary } from "../types/types";
import type { CountAnswers } from "../utils/drawCategories";
import { buildCategoryFilter, type CategoryFilterContext } from "../validators";

// O catálogo da IGDB muda devagar; um dia de cache evita repetir as mesmas
// contagens a cada rodada sorteada
const ANSWER_COUNT_TTL_MS = 24 * 60 * 60 * 1000;

// A contagem em andamento fica no cache como promessa: rodadas sorteadas ao mesmo
// tempo esperam a mesma consulta em vez de repeti-la na IGDB
const answerCountCache = new Map<string, { count: Promise<number>; expiresAt: number }>();

export const clearAnswerCountCache = (): void => answerCountCache.clear();

// O filtro montado determina a contagem, inclusive os vencedores de um prêmio: um vencedor
// novo no banco gera outra chave. Ordenado porque linha × coluna = coluna × linha.
const groupFilterOf = (group: readonly Category[], context: CategoryFilterContext): string =>
    group
        .map((category) => buildCategoryFilter(category, context))
        .sort()
        .join(" & ");

const isCachedAt = (groupFilter: string, now: number): boolean =>
    (answerCountCache.get(groupFilter)?.expiresAt ?? 0) > now;

const cacheFreshCounts = (groupFilters: readonly string[], now: number): void => {
    const batch = countGamesMatching(groupFilters.map((filter) => `${filter} & ${PLAYABLE_GAME_TYPES_FILTER}`));

    groupFilters.forEach((groupFilter, index) => {
        const entry = { count: batch.then((counts) => counts[index]), expiresAt: now + ANSWER_COUNT_TTL_MS };
        answerCountCache.set(groupFilter, entry);

        // Falha não fica em cache: a próxima rodada tenta de novo
        entry.count.catch(() => {
            if (answerCountCache.get(groupFilter) === entry) answerCountCache.delete(groupFilter);
        });
    });
};

export const loadFilterContext = async (): Promise<CategoryFilterContext> => ({
    awardWinnerIds: await findAwardWinnerIds(),
});

export const createAnswerCounter = (context: CategoryFilterContext): CountAnswers => async (groups) => {
    const now = Date.now();
    const groupFilters = groups.map((group) => groupFilterOf(group, context));
    const missingFilters = [...new Set(groupFilters)].filter((groupFilter) => !isCachedAt(groupFilter, now));

    if (missingFilters.length > 0) cacheFreshCounts(missingFilters, now);

    return Promise.all(groupFilters.map((groupFilter) => answerCountCache.get(groupFilter)!.count));
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
