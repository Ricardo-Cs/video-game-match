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

// --- Rodadas ---

export const GRID_SIZE = 3;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const ROUND_STATUSES = ["IN_PROGRESS", "FINISHED"] as const;

// Células numeradas por linha: 0 1 2 / 3 4 5 / 6 7 8
export const cellIndexSchema = z.number().int().min(0).max(CELL_COUNT - 1);

export const roundParamsSchema = z.object({
    id: z.uuid("Rodada inválida."),
});

export const createGuessSchema = z.object({
    cell: cellIndexSchema,
    gameId: z.coerce.number().int().positive(),
});

// O cliente só precisa saber o que exibir; a condição de cada categoria fica no servidor
export const categoryViewSchema = categorySchema.pick({ name: true, type: true });

export const solvedCellSchema = z.object({
    cell: cellIndexSchema,
    game: z.object({
        id: z.number(),
        name: z.string(),
        coverUrl: z.string().nullable(),
    }),
});

export const roundViewSchema = z.object({
    id: z.string(),
    status: z.enum(ROUND_STATUSES),
    rows: z.array(categoryViewSchema),
    columns: z.array(categoryViewSchema),
    maxAttempts: z.number(),
    attemptsUsed: z.number(),
    solvedCells: z.array(solvedCellSchema),
});

export const guessResultSchema = z.object({
    correct: z.boolean(),
    round: roundViewSchema,
});

export type CellIndex = z.infer<typeof cellIndexSchema>;
export type RoundStatus = typeof ROUND_STATUSES[number];
export type CreateGuessInput = z.input<typeof createGuessSchema>;
export type CreateGuessData = z.output<typeof createGuessSchema>;
export type CategoryView = z.infer<typeof categoryViewSchema>;
export type SolvedCell = z.infer<typeof solvedCellSchema>;
export type RoundView = z.infer<typeof roundViewSchema>;
export type GuessResult = z.infer<typeof guessResultSchema>;
