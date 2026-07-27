import { z } from "zod";

export const searchParamsSchema = z.object({
    search: z.string().min(1, "O termo de busca não pode ser vazio."),
});

const conditionSchema = z.object({
    field: z.string(),
    operator: z.string(),
    value: z.union([z.string(), z.number()]),
});

const categorySchema = z.object({
    name: z.string(),
    type: z.string(),
    condition: conditionSchema,
});

export const verifyAnswerSchema = z.object({
    id: z.union([z.string(), z.number()]),
    categories: z.array(categorySchema).min(1, "Envie ao menos uma categoria."),
});
