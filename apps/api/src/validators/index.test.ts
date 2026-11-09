import { describe, expect, it } from "vitest";

import type { Category, CategoryType } from "@vgm/contracts";
import { buildCategoryFilter, buildFilterForAll, type CategoryFilterContext } from "./index";

const CONTEXT: CategoryFilterContext = {
    awardWinnerIds: new Map([["Game Of The Year", [1942, 119133]]]),
};

const named = <T extends Category>(category: Omit<T, "name">): T => ({ name: "categoria", ...category }) as T;

const filterOf = (category: Omit<Category, "name">) => buildCategoryFilter(named(category), CONTEXT);

describe("buildCategoryFilter", () => {
    it.each([
        { type: "genre", field: "genres" },
        { type: "theme", field: "themes" },
        { type: "platform", field: "platforms" },
        { type: "gameMode", field: "game_modes" },
        { type: "perspective", field: "player_perspectives" },
    ] as const)("$type casa qualquer um dos ids em $field", ({ type, field }) => {
        expect(filterOf({ type, condition: { ids: [2, 3] } })).toBe(`(${field} = (2,3))`);
    });

    it("franquia aceita tanto a franquia principal quanto a lista de franquias", () => {
        expect(filterOf({ type: "franchise", condition: { ids: [596] } })).toBe(
            "((franchises = (596) | franchise = (596)))",
        );
    });

    it("empresa exige o papel (desenvolvedora ou publicadora)", () => {
        expect(filterOf({ type: "company", condition: { companyId: 70, role: "developer" } })).toBe(
            "(involved_companies.company = 70 & involved_companies.developer = true)",
        );
        expect(filterOf({ type: "company", condition: { companyId: 70, role: "publisher" } })).toBe(
            "(involved_companies.company = 70 & involved_companies.publisher = true)",
        );
    });

    it.each([
        { operator: "<", expected: "first_release_date < 946684800" },
        { operator: "<=", expected: "first_release_date < 978307200" },
        { operator: ">", expected: "first_release_date >= 978307200" },
        { operator: ">=", expected: "first_release_date >= 946684800" },
    ] as const)("ano $operator 2000 vira limite em 1º de janeiro (UTC)", ({ operator, expected }) => {
        expect(filterOf({ type: "releaseYear", condition: { operator, value: 2000 } })).toBe(`(${expected})`);
    });

    it("nota compara o total_rating", () => {
        expect(filterOf({ type: "rating", condition: { operator: ">=", value: 85 } })).toBe("(total_rating >= 85)");
    });

    it("geração de console olha a geração das plataformas", () => {
        expect(filterOf({ type: "consoleGeneration", condition: { generation: 6 } })).toBe(
            "(platforms.generation = 6)",
        );
    });

    it("DLC aceita DLCs ou expansões", () => {
        expect(filterOf({ type: "dlcs", condition: {} })).toBe("((dlcs != null | expansions != null))");
    });

    it("prêmio aceita os vencedores e as edições deles", () => {
        expect(filterOf({ type: "award", condition: { award: "Game Of The Year" } })).toBe(
            "((id = (1942,119133) | version_parent = (1942,119133)))",
        );
    });

    it("lança AppError para prêmio sem vencedores cadastrados", () => {
        expect(() => filterOf({ type: "award", condition: { award: "Prêmio Inexistente" } })).toThrow(
            expect.objectContaining({ name: "AppError" }),
        );
    });

    it.each(["genero", "toString", "constructor"])("lança AppError para o tipo sem filtro %j", (unknownType) => {
        expect(() => filterOf({ type: unknownType as CategoryType, condition: { ids: [1] } } as never)).toThrow(
            expect.objectContaining({ name: "AppError" }),
        );
    });
});

describe("buildFilterForAll", () => {
    it("exige todas as categorias ao mesmo tempo", () => {
        const categories = [
            named<Category>({ type: "genre", condition: { ids: [12] } }),
            named<Category>({ type: "platform", condition: { ids: [8] } }),
        ];

        expect(buildFilterForAll(categories, CONTEXT)).toBe("(genres = (12)) & (platforms = (8))");
    });
});
