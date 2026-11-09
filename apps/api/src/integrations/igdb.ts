import axios from "axios";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { GameSearchResponse, GameSummary } from "../types/types";
import { getAccessToken, invalidateAccessToken } from "./twitchAuth";

declare module "axios" {
    interface AxiosRequestConfig {
        // Marca a requisição já repetida após um 401, para não entrar em loop
        _retriedAuth?: boolean
    }
}

// Tipos de jogo da IGDB considerados "jogáveis" na busca
// https://api-docs.igdb.com/#game-enums
export const GAME_TYPES = {
    MAIN_GAME: 0,
    EXPANSION: 2,
    STANDALONE_EXPANSION: 8,
    MOD: 9,
    EPISODE: 10,
} as const;

const igdb = axios.create({
    baseURL: env.GAME_API_BASE_URL,
    timeout: 10 * 1000,
    headers: {
        "Client-ID": env.CLIENT_ID,
        "Accept": "application/json",
        "Content-Type": "text/plain",
    },
});

igdb.interceptors.request.use(async (config) => {
    config.headers.Authorization = `Bearer ${await getAccessToken()}`;
    return config;
});

// Token revogado antes do prazo: gera outro e repete a requisição uma única vez
igdb.interceptors.response.use(undefined, async (error) => {
    const config = axios.isAxiosError(error) ? error.config : undefined;

    if (config && error.response?.status === 401 && !config._retriedAuth) {
        invalidateAccessToken();
        return igdb.request({ ...config, _retriedAuth: true });
    }

    throw error;
});

// O termo vai dentro de uma string Apicalypse: aspas ou barra invertida vindas
// do usuário fechariam a string e injetariam cláusulas na query
export const sanitizeSearch = (search: string) => search.replace(/["\\]/g, "").trim();

// O mesmo recorte vale para a busca e para contar as respostas de uma célula:
// o que conta como resposta é o que o jogador consegue encontrar
export const PLAYABLE_GAME_TYPES_FILTER = `game_type = (${Object.values(GAME_TYPES).join(",")})`;

// A IGDB aceita no máximo 10 consultas por multiquery
const MULTIQUERY_LIMIT = 10;

export const buildSearchQuery = (search: string) =>
    `search "${sanitizeSearch(search)}"; fields id, name, first_release_date, game_type; where ${PLAYABLE_GAME_TYPES_FILTER};`;

// O id é interpolado cru na query, então só passa inteiro positivo
export const assertValidGameId = (id: number): void => {
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError("Id de jogo inválido.", 400);
    }
};

const GAME_RESULT_NAME = "game";

export const buildGameCheckMultiquery = (gameId: number, filters: readonly string[]): string => {
    assertValidGameId(gameId);

    const gameQuery = `query games "${GAME_RESULT_NAME}" { fields name, cover.url; where id = ${gameId}; };`;
    const filterQueries = filters.map(
        (filter, index) => `query games/count "${index}" { where id = ${gameId} & ${filter}; };`,
    );

    return [gameQuery, ...filterQueries].join("\n");
};

export const buildCountMultiquery = (filters: readonly string[]): string =>
    filters.map((filter, index) => `query games/count "${index}" { where ${filter}; };`).join("\n");

type MultiqueryResult = { name: string; count?: number; result?: unknown[] };

const runMultiquery = async (body: string): Promise<Map<string, MultiqueryResult>> => {
    const { data } = await igdb.post<MultiqueryResult[]>("/multiquery", body);
    return new Map(data.map((entry) => [entry.name, entry]));
};

const countAt = (results: Map<string, MultiqueryResult>, index: number): number => results.get(String(index))?.count ?? 0;

const chunk = <T>(items: readonly T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));

export const searchGames = async (search: string): Promise<GameSearchResponse[]> => {
    if (!sanitizeSearch(search)) return [];

    const { data } = await igdb.post<GameSearchResponse[]>("/games", buildSearchQuery(search));
    return data;
};

// Em série, e não em paralelo, por causa do rate limit da IGDB (~4 req/s)
export const countGamesMatching = async (filters: readonly string[]): Promise<number[]> => {
    const counts: number[] = [];

    for (const batch of chunk(filters, MULTIQUERY_LIMIT)) {
        const results = await runMultiquery(buildCountMultiquery(batch));
        counts.push(...batch.map((_filter, index) => countAt(results, index)));
    }

    return counts;
};

export interface GameCheck {
    game: GameSummary | undefined;
    matchesPerFilter: boolean[];
}

// Uma requisição só traz o jogo e diz, filtro a filtro, se ele casa.
// Cabe em uma multiquery enquanto a célula tiver até 9 categorias (são 2).
export const checkGameAgainstFilters = async (gameId: number, filters: readonly string[]): Promise<GameCheck> => {
    const results = await runMultiquery(buildGameCheckMultiquery(gameId, filters));
    const [game] = (results.get(GAME_RESULT_NAME)?.result ?? []) as GameSummary[];

    return { game, matchesPerFilter: filters.map((_filter, index) => countAt(results, index) > 0) };
};
