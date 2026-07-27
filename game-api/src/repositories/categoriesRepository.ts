import path from "path";
import fs from "fs";
import { CategoriesData } from "../types/types";

const dataPath = path.resolve(__dirname, "../data/data.json");

export const getCategoriesData = (): CategoriesData => {
    const rawData = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(rawData) as CategoriesData;
};
