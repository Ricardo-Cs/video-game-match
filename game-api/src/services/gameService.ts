import axios from "axios";
import { env } from "../env";
import path from "path";
import fs from "fs";
import { createCategories } from "../utils/createCategories";

const baseApi = env.GAME_API_BASE_URL;

export const createCategoriesService = () => {
    const dataPath = path.resolve(__dirname, '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const categoriesData = JSON.parse(rawData);

    const selectedCategories = createCategories(categoriesData);
    return selectedCategories;
};

export const gameSearchService = async (search: string) => {
    const response = await axios.get(`${baseApi}search/?api_key=${env.API_KEY}&format=json&query="${search}"&resources=game&field_list=name,guid`)
    return response;
};