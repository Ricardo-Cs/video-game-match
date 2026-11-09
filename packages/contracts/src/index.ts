import { z } from "zod";

// Contrato entre a API e o web: os schemas validam a requisição na API e os
// tipos inferidos deles tipam os dois lados, sem duplicação.

// --- Categorias ---

// Cada tipo de categoria tem a condição no seu formato, sempre por id da IGDB
// (nomes mudam e têm grafias variadas; ids não).

export const COMPARISON_OPERATORS = ["<", "<=", ">", ">="] as const;
export const COMPANY_ROLES = ["developer", "publisher"] as const;

const igdbIdSchema = z.number().int().positive();

// O jogo atende se tiver qualquer um dos ids
const anyOfIdsSchema = z.object({ ids: z.array(igdbIdSchema).min(1) });

const comparisonSchema = z.object({
    operator: z.enum(COMPARISON_OPERATORS),
    value: z.number(),
});

const categoryOf = <Type extends string, Condition extends z.ZodType>(type: Type, condition: Condition) =>
    z.object({ name: z.string().min(1), type: z.literal(type), condition });

export const categorySchema = z.discriminatedUnion("type", [
    categoryOf("genre", anyOfIdsSchema),
    categoryOf("theme", anyOfIdsSchema),
    categoryOf("platform", anyOfIdsSchema),
    categoryOf("gameMode", anyOfIdsSchema),
    categoryOf("perspective", anyOfIdsSchema),
    categoryOf("franchise", anyOfIdsSchema),
    categoryOf("company", z.object({ companyId: igdbIdSchema, role: z.enum(COMPANY_ROLES) })),
    categoryOf("consoleGeneration", z.object({ generation: z.number().int().positive() })),
    categoryOf("releaseYear", comparisonSchema),
    // total_rating da IGDB, de 0 a 100
    categoryOf("rating", comparisonSchema),
    categoryOf("dlcs", z.object({})),
    // Nome do prêmio na tabela awards; os vencedores ficam no banco, ligados por igdb_id
    categoryOf("award", z.object({ award: z.string().min(1) })),
]);

export type Category = z.infer<typeof categorySchema>;
export type CategoryType = Category["type"];
export type CategoryOfType<Type extends CategoryType> = Extract<Category, { type: Type }>;
export type ComparisonOperator = typeof COMPARISON_OPERATORS[number];
export type CompanyRole = typeof COMPANY_ROLES[number];

export const CATEGORY_TYPES = categorySchema.options.map((option) => option.shape.type.value) as [
    CategoryType,
    ...CategoryType[],
];

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
export const categoryViewSchema = z.object({ name: z.string(), type: z.enum(CATEGORY_TYPES) });

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
    // Células que receberam palpite errado e ainda não foram resolvidas
    missedCells: z.array(cellIndexSchema),
});

export const guessResultSchema = z.object({
    correct: z.boolean(),
    // Categorias da célula que o jogo não atendeu; vazia quando o palpite está certo
    unmetCategories: z.array(categoryViewSchema),
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
