import axios from "axios";
import { env } from "../config/env";
import { GameCheckApiResponse, GameSearchResponse } from "../types/types";

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
    headers: {
        "Client-ID": env.CLIENT_ID,
        "Authorization": `Bearer ${env.CLIENT_TOKEN}`,
        "Accept": "application/json",
        "Content-Type": "text/plain",
    },
});

export const searchGames = async (search: string): Promise<GameSearchResponse[]> => {
    const gameTypeFilter = Object.values(GAME_TYPES)
        .map((type) => `game_type = ${type}`)
        .join(" | ");

    const query = `search "${search}"; fields id, name, first_release_date, game_type; where ${gameTypeFilter};`;

    const { data } = await igdb.post<GameSearchResponse[]>("/games", query);
    return data;
};

export const getGameById = async (id: string | number): Promise<GameCheckApiResponse | undefined> => {
    const query = `fields name, genres.name, first_release_date, platforms.name, dlcs, involved_companies.company.name, player_perspectives.name, game_modes.name, cover.url; where id = ${id};`;

    const { data } = await igdb.post<GameCheckApiResponse[]>("/games", query);
    return data[0];
};
