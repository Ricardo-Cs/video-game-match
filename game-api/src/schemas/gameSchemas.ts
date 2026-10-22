import { z } from "zod";

export const CATEGORY_TYPES = ["genre", "releaseYear", "company", "platform", "gameMode", "dlcs", "award"] as const;
export const CONDITION_OPERATORS = ["includes", "<", "<=", ">", ">="] as const;

export const searchParamsSchema = z.object({
    search: z.string().trim().min(1, "O termo de busca não pode ser vazio.").max(100, "Termo de busca longo demais."),
});

const conditionSchema = z.object({
    field: z.string(),
    operator: z.enum(CONDITION_OPERATORS),
    value: z.union([z.string(), z.number()]),
});

const categorySchema = z.object({
    name: z.string(),
    type: z.enum(CATEGORY_TYPES),
    condition: conditionSchema,
});

export const categoriesDataSchema = z.object({
    categories: z.array(categorySchema),
});

export const verifyAnswerSchema = z.object({
    // Vai direto para a query da IGDB, então só aceita inteiro positivo
    id: z.coerce.number().int().positive(),
    categories: z.array(categorySchema).min(1, "Envie ao menos uma categoria."),
});
