import { describe, expect, it } from "vitest";

import { categoriesDataSchema, getCategoriesData } from "./categoriesRepository";

describe("categoriesRepository", () => {
    it("carrega o data.json real, já validado pelo schema", () => {
        const data = getCategoriesData();

        expect(data.categories.length).toBeGreaterThan(0);
        expect(() => categoriesDataSchema.parse(data)).not.toThrow();
    });

    it("lê o arquivo uma única vez e devolve sempre o mesmo objeto", () => {
        expect(getCategoriesData()).toBe(getCategoriesData());
    });

    it("recusa tipo de categoria fora do enum", () => {
        const invalid = {
            categories: [{ name: "x", type: "genero", condition: { field: "genre", operator: "includes", value: "RPG" } }],
        };

        expect(() => categoriesDataSchema.parse(invalid)).toThrow();
    });
});
