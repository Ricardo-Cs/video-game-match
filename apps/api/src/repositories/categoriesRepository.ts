import { z } from "zod";
import { categorySchema } from "@vgm/contracts";
import { CategoriesData } from "../types/types";
import rawCategoriesData from "../data/data.json";

export const categoriesDataSchema = z.object({
    categories: z.array(categorySchema),
});

// O JSON entra no bundle e é validado uma única vez na carga do módulo.
// Um tipo ou operador inválido derruba o boot em vez de virar
// "resposta incorreta" silenciosa durante a partida.
const categoriesData: CategoriesData = categoriesDataSchema.parse(rawCategoriesData);

export const getCategoriesData = (): CategoriesData => categoriesData;
