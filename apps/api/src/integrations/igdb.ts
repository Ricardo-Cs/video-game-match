import axios from "axios";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { GameSearchResponse, GameSummary } from "../types/types";
import { createRequestSpacer, sleep } from "../utils/requestSpacer";
import { getAccessToken, invalidateAccessToken } from "./twitchAuth";

declare module "axios" {
    interface AxiosRequestConfig {
        // Marca a requisição já repetida após um 401, para não entrar em loop
        _retriedAuth?: boolean
        // Quantas vezes a requisição já foi repetida após um 429
        _rateLimitRetries?: number
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

const HTTP_UNAUTHORIZED = 401;
const HTTP_TOO_MANY_REQUESTS = 429;
const TIMEOUT_ERROR_CODES = new Set(["ECONNABORTED", "ETIMEDOUT"]);

// A IGDB permite ~4 req/s: espaçar as saídas evita o 429 em vez de só reagir a ele
const IGDB_REQUEST_INTERVAL_MS = 260;
const MAX_RATE_LIMIT_RETRIES = 2;
const RATE_LIMIT_BACKOFF_MS = 1000;

const waitForRequestSlot = createRequestSpacer(IGDB_REQUEST_INTERVAL_MS);

// Quanto esperar antes de repetir após um 429; null quando as repetições acabaram
export const rateLimitRetryDelay = (retriesSoFar: number): number | null =>
    retriesSoFar < MAX_RATE_LIMIT_RETRIES ? RATE_LIMIT_BACKOFF_MS * (retriesSoFar + 1) : null;

// Falha da IGDB é falha de um serviço externo (502/503/504), não erro interno nosso
export const toIgdbAppError = (error: unknown): AppError => {
    if (error instanceof AppError) return error;

    if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_TOO_MANY_REQUESTS) {
            return new AppError("A IGDB está recebendo requisições demais. Tente de novo em instantes.", 503);
        }
        if (error.code && TIMEOUT_ERROR_CODES.has(error.code)) {
            return new AppError("A IGDB demorou demais para responder.", 504);
        }
    }

    console.error(error);
    return new AppError("Não foi possível consultar a IGDB.", 502);
};

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
    await waitForRequestSlot();
    config.headers.Authorization = `Bearer ${await getAccessToken()}`;
    return config;
});

igdb.interceptors.response.use(undefined, async (error) => {
    const config = axios.isAxiosError(error) ? error.config : undefined;
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    // Token revogado antes do prazo: gera outro e repete a requisição uma única vez
    if (config && status === HTTP_UNAUTHORIZED && !config._retriedAuth) {
        invalidateAccessToken();
        return igdb.request({ ...config, _retriedAuth: true });
    }

    if (config && status === HTTP_TOO_MANY_REQUESTS) {
        const retriesSoFar = config._rateLimitRetries ?? 0;
        const delay = rateLimitRetryDelay(retriesSoFar);

        if (delay !== null) {
            await sleep(delay);
            return igdb.request({ ...config, _rateLimitRetries: retriesSoFar + 1 });
        }
    }

    throw toIgdbAppError(error);
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

    // Tipo fora do recorte jogável (bundle, DLC, pack) não aparece na busca nem conta como
    // resposta da célula; aqui ele vira "jogo não encontrado" em vez de um palpite válido
    const gameQuery = `query games "${GAME_RESULT_NAME}" { fields name, cover.url; where id = ${gameId} & ${PLAYABLE_GAME_TYPES_FILTER}; };`;
    const filterQueries = filters.map(
        (filter, index) => `query games/count "${index}" { where id = ${gameId} & ${filter}; };`,
    );

    return [gameQuery, ...filterQueries].join("\n");
};

export const buildCountMultiquery = (filters: readonly string[]): string =>
    filters.map((filter, index) => `query games/count "${index}" { where ${filter}; };`).join("\n");

export type MultiqueryResult = { name: string; count?: number; result?: unknown[] };

const runMultiquery = async (body: string): Promise<Map<string, MultiqueryResult>> => {
    const { data } = await igdb.post<MultiqueryResult[]>("/multiquery", body);
    return new Map(data.map((entry) => [entry.name, entry]));
};

// Sem a contagem não dá para saber se o jogo casa: assumir 0 viraria um "palpite errado" calado
export const countAt = (results: ReadonlyMap<string, MultiqueryResult>, index: number): number => {
    const count = results.get(String(index))?.count;

    if (typeof count !== "number") {
        throw new AppError("A IGDB devolveu uma resposta incompleta.", 502);
    }

    return count;
};

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
