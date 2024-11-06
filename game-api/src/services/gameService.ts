import axios, { request } from "axios";
import { env } from "../env";
import path from "path";
import fs from "fs";
import { isValid } from "../utils/isValid";
import { createCategories } from "../utils/createCategories";
import { answerData, GameSearchResponse } from "../types/types";

const baseApi = env.GAME_API_BASE_URL;

export const createCategoriesService = () => {
    const dataPath = path.resolve(__dirname, '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const categoriesData = JSON.parse(rawData);

    const selectedCategories = createCategories(categoriesData);
    return selectedCategories;
};

export const gameSearchService = async (search: string) => {
    const response = await axios.get(`${baseApi}search/?api_key=${env.API_KEY}&format=json&query="${search}"&resources=game&field_list=name,guid`);
    return response;
};

export const verifyAnswerService = async (data: answerData) => {
    const request = await axios.get(`${baseApi}game/${data.guid}/?api_key=${env.API_KEY}&format=json&field_list=developers,original_release_date,genres,platforms,dlcs,image`);

    // return request.data;
    const response: boolean = isValid(request, data);
    if (response) {
        return { answer: true, image: request.data.results.image?.original_url }
    } else {
        return { answer: false };
    }
}