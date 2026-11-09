import type { Category, CategoryOfType, CategoryType } from "@vgm/contracts";
import { AppError } from "../errors/AppError";
import { anyOfIdsFilter } from "./anyOfIdsFilter";
import { awardFilter, type AwardWinnerIds } from "./awardFilter";
import { companyFilter } from "./companyFilter";
import { consoleGenerationFilter } from "./consoleGenerationFilter";
import { dlcsFilter } from "./dlcsFilter";
import { ratingFilter } from "./ratingFilter";
import { releaseYearFilter } from "./releaseYearFilter";

// O que um filtro precisa além da própria condição: hoje, só os vencedores de prêmios, que vêm do banco
export interface CategoryFilterContext {
    awardWinnerIds: AwardWinnerIds;
}

type CategoryFilterBuilder<Type extends CategoryType> = (
    condition: CategoryOfType<Type>["condition"],
    context: CategoryFilterContext,
) => string;

// Cada categoria vira uma cláusula `where` da IGDB. A mesma cláusula valida o palpite
// e conta as respostas de uma célula, então "célula solucionável" e "palpite certo"
// nunca discordam. Um tipo novo é uma entrada aqui; o tipo mapeado acusa o que faltar.
const categoryFilters: { [Type in CategoryType]: CategoryFilterBuilder<Type> } = {
    genre: ({ ids }) => anyOfIdsFilter("genres", ids),
    theme: ({ ids }) => anyOfIdsFilter("themes", ids),
    platform: ({ ids }) => anyOfIdsFilter("platforms", ids),
    gameMode: ({ ids }) => anyOfIdsFilter("game_modes", ids),
    perspective: ({ ids }) => anyOfIdsFilter("player_perspectives", ids),
    franchise: ({ ids }) => `(${anyOfIdsFilter("franchises", ids)} | ${anyOfIdsFilter("franchise", ids)})`,
    company: companyFilter,
    consoleGeneration: consoleGenerationFilter,
    releaseYear: releaseYearFilter,
    rating: ratingFilter,
    dlcs: dlcsFilter,
    award: (condition, { awardWinnerIds }) => awardFilter(condition, awardWinnerIds),
};

// O schema já barra tipos desconhecidos; chegar aqui sem filtro (ex.: "toString",
// herdado do protótipo) é bug nosso e deve falhar alto
export const buildCategoryFilter = (category: Category, context: CategoryFilterContext): string => {
    if (!Object.hasOwn(categoryFilters, category.type)) {
        throw new AppError(`Tipo de categoria sem filtro: ${category.type}`);
    }

    // O TypeScript não liga o tipo da categoria ao do builder escolhido pela chave
    const build = categoryFilters[category.type] as CategoryFilterBuilder<CategoryType>;
    return `(${build(category.condition as never, context)})`;
};

export const buildFilterForAll = (categories: readonly Category[], context: CategoryFilterContext): string =>
    categories.map((category) => buildCategoryFilter(category, context)).join(" & ");
