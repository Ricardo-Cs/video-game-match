import axios, { request } from "axios";
import { env } from "../env";
import path from "path";
import fs from "fs";
import { isValid } from "../utils/isValid";
import { createCategories } from "../utils/createCategories";
import { answerData, GameSearchResponse } from "../types/types";

const baseApi = env.GAME_API_BASE_URL;
const headers = {
    "Authorization": "Bearer k720nae7u8gkuljrg3nziypymool1y",
    "Client-ID": `${env.CLIENT_ID}`,
    "Content-Type": "text/plain"
}

export const createCategoriesService = () => {
    const dataPath = path.resolve(__dirname, '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const categoriesData = JSON.parse(rawData);

    const selectedCategories = createCategories(categoriesData);
    return selectedCategories;
};

export const gameSearchService = async (search: string) => {
    const response = await axios.post(
        'https://api.igdb.com/v4/games',
        `search "${search}"; fields id, name; where category != 1;`,
        { headers }
    );
    return response;
};

export const verifyAnswerService = async (data: answerData) => {
    const request = await axios.post(
        'https://api.igdb.com/v4/games',
        `fields genres, involved_companies, name, platforms, release_dates; where id = ${data.id};`,
        { headers }
    );

    return request.data;
    // const response: boolean = isValid(request, data);
    // return request.data.results
    // if (response) {
    //     return { answer: true, image: request.data.results.image?.icon_url }
    // } else {
    //     return { answer: false };
    // }
}