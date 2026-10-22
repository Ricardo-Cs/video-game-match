import path from "path";
import fs from "fs";
import { CategoriesData } from "../types/types";
import { categoriesDataSchema } from "../schemas/gameSchemas";

const dataPath = path.resolve(__dirname, "../data/data.json");

// O arquivo é estático: lê e valida uma única vez na carga do módulo.
// Um tipo ou operador inválido no JSON derruba o boot em vez de virar
// "resposta incorreta" silenciosa durante a partida.
const categoriesData: CategoriesData = categoriesDataSchema.parse(
    JSON.parse(fs.readFileSync(dataPath, "utf-8")),
);

export const getCategoriesData = (): CategoriesData => categoriesData;
