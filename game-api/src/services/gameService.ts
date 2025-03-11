import axios, { request } from "axios";
import { env } from "../config/env";
import path from "path";
import fs from "fs";
import { createCategories } from "../utils/createCategories";
import { answerData, GameCheckApiResponse, GameSearchResponse } from "../types/types";
import { checkAnswer } from "../validators";

const baseApi = env.GAME_API_BASE_URL;

export const createCategoriesService = () => {
    const dataPath = path.resolve(__dirname, '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const categoriesData = JSON.parse(rawData);

    const selectedCategories = createCategories(categoriesData);
    return selectedCategories;
};

export const gameSearchService = async (search: string): Promise<{ name: string, release_year: number | undefined }[]> => {
    try {
        const query = `search "${search}"; fields name, first_release_date, game_type; where game_type = 0 | game_type = 2 | game_type = 8 | game_type = 9 | game_type = 10;`;
        const response = await axios.post<GameSearchResponse[]>(
            `${baseApi}/games`, query, {
            headers: {
                'Client-ID': env.CLIENT_ID,
                'Authorization': `Bearer ${env.CLIENT_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            }
        });

        return response.data.map((game) => ({
            name: game.name,
            release_year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : undefined,
        }));
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        throw new Error('Não foi possível buscar os jogos. Tente novamente mais tarde.');
    }
};

export const verifyAnswerService = async (data: answerData) => {
    try {
        const query = `fields name, genres.name, first_release_date, platforms.name, dlcs, involved_companies.company.name, player_perspectives.name, cover.url; where id = ${data.id};`;
        const response = await axios.post<GameCheckApiResponse[]>(
            `${baseApi}/games`, query, {
            headers: {
                'Client-ID': env.CLIENT_ID,
                'Authorization': `Bearer ${env.CLIENT_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            }
        });

        return checkAnswer(response.data[0], data)
        // console.log(request.data)
        // const isValidResponse = isValid(request, data);
        // return isValidResponse
        //     ? { answer: true, image: request.data.results.image?.original_url }
        //     : { answer: false };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to verify answer. Please try again later.");
    }
};
