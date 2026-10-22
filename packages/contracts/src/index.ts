import { z } from "zod";

// Contrato entre a API e o web: os schemas validam a requisição na API e os
// tipos inferidos deles tipam os dois lados, sem duplicação.

// --- Categorias ---

export const CATEGORY_TYPES = ["genre", "releaseYear", "company", "platform", "gameMode", "dlcs", "award"] as const;
export const CONDITION_OPERATORS = ["includes", "<", "<=", ">", ">="] as const;

export const conditionSchema = z.object({
    field: z.string(),
    operator: z.enum(CONDITION_OPERATORS),
    value: z.union([z.string(), z.number()]),
});

export const categorySchema = z.object({
    name: z.string(),
    type: z.enum(CATEGORY_TYPES),
    condition: conditionSchema,
});

export type CategoryType = typeof CATEGORY_TYPES[number];
export type ConditionOperator = typeof CONDITION_OPERATORS[number];
export type Condition = z.infer<typeof conditionSchema>;
export type Category = z.infer<typeof categorySchema>;

// --- Busca de jogos ---

export const SEARCH_MAX_LENGTH = 100;

export const searchParamsSchema = z.object({
    search: z.string().trim().min(1, "O termo de busca não pode ser vazio.").max(SEARCH_MAX_LENGTH, "Termo de busca longo demais."),
});

export const gameSearchResultSchema = z.object({
    id: z.number(),
    name: z.string(),
    release_year: z.number().optional(),
});

export type GameSearchResult = z.infer<typeof gameSearchResultSchema>;

// --- Verificação de resposta ---

export const verifyAnswerSchema = z.object({
    // Vai direto para a query da IGDB, então só aceita inteiro positivo
    id: z.coerce.number().int().positive(),
    categories: z.array(categorySchema).min(1, "Envie ao menos uma categoria."),
});

// O que o cliente envia (id pode chegar como string) e o que a API recebe já validado
export type VerifyAnswerInput = z.input<typeof verifyAnswerSchema>;
export type VerifyAnswerData = z.output<typeof verifyAnswerSchema>;

export const answerResultSchema = z.object({
    answer: z.boolean(),
    image: z.string().nullable().optional(),
    message: z.string().optional(),
});

export type AnswerResult = z.infer<typeof answerResultSchema>;
