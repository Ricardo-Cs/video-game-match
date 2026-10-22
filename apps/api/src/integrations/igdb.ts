import axios from "axios";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { GameCheckApiResponse, GameSearchResponse } from "../types/types";
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

export const buildSearchQuery = (search: string) => {
    const gameTypeFilter = Object.values(GAME_TYPES)
        .map((type) => `game_type = ${type}`)
        .join(" | ");

    return `search "${sanitizeSearch(search)}"; fields id, name, first_release_date, game_type; where ${gameTypeFilter};`;
};

export const buildGameByIdQuery = (id: number) => {
    // O id é interpolado cru na query, então só passa inteiro positivo
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError("Id de jogo inválido.", 400);
    }

    return `fields name, genres.name, first_release_date, platforms.name, dlcs, involved_companies.company.name, player_perspectives.name, game_modes.name, cover.url; where id = ${id};`;
};

export const searchGames = async (search: string): Promise<GameSearchResponse[]> => {
    if (!sanitizeSearch(search)) return [];

    const { data } = await igdb.post<GameSearchResponse[]>("/games", buildSearchQuery(search));
    return data;
};

export const getGameById = async (id: number): Promise<GameCheckApiResponse | undefined> => {
    const { data } = await igdb.post<GameCheckApiResponse[]>("/games", buildGameByIdQuery(id));
    return data[0];
};
