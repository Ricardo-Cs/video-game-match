import { describe, expect, it } from "vitest";

import type { Category } from "@vgm/contracts";
import { getCategoriesData } from "../repositories/categoriesRepository";
import { drawCategories } from "./drawCategories";
import { CATEGORIES_PER_ROUND } from "./roundGrid";

const CATALOG = getCategoriesData().categories;

// Duplicado de propósito: se a lista de drawCategories.ts mudar sem que esta
// acompanhe, o teste deixa de cobrir o par novo e isso precisa aparecer.
const INCOMPATIBLE_PAIRS = [
    ["Jogo da Nintendo", "Jogo da From Software"],
    ["Lançado depois de 1999", "Lançado antes de 1999"],
    ["Lançado em 2020 ou depois", "Lançado antes de 1999"],
];

const SEEDS = Array.from({ length: 200 }, (_, index) => `seed-${index}`);

const namesOf = (categories: Category[]) => categories.map((category) => category.name);

describe("drawCategories", () => {
    it(`sorteia exatamente ${CATEGORIES_PER_ROUND} categorias`, () => {
        expect(drawCategories(CATALOG, "qualquer")).toHaveLength(CATEGORIES_PER_ROUND);
    });

    it("sorteia a mesma grade para a mesma seed", () => {
        expect(drawCategories(CATALOG, "grade-do-dia")).toEqual(drawCategories(CATALOG, "grade-do-dia"));
    });

    it("sorteia grades diferentes para seeds diferentes", () => {
        const grids = SEEDS.map((seed) => namesOf(drawCategories(CATALOG, seed)).join("|"));

        expect(new Set(grids).size).toBeGreaterThan(1);
    });

    it("nunca repete categoria na mesma rodada", () => {
        for (const seed of SEEDS) {
            const selected = namesOf(drawCategories(CATALOG, seed));
            expect(new Set(selected).size).toBe(selected.length);
        }
    });

    it("nunca sorteia um par incompatível", () => {
        for (const seed of SEEDS) {
            const selected = namesOf(drawCategories(CATALOG, seed));

            for (const [first, second] of INCOMPATIBLE_PAIRS) {
                expect(
                    selected.includes(first) && selected.includes(second),
                    `seed ${seed} sorteou o par incompatível ${first} + ${second}`,
                ).toBe(false);
            }
        }
    });

    it("só devolve categorias que existem no catálogo", () => {
        const known = new Set(namesOf(CATALOG));

        for (const name of namesOf(drawCategories(CATALOG, "qualquer"))) {
            expect(known).toContain(name);
        }
    });

    it("lança AppError quando o catálogo não tem categorias suficientes", () => {
        expect(() => drawCategories(CATALOG.slice(0, 3), "qualquer")).toThrow(
            expect.objectContaining({ name: "AppError" }),
        );
    });

    it("lança AppError quando as categorias restantes são incompatíveis entre si", () => {
        const nintendo = CATALOG.find((category) => category.name === "Jogo da Nintendo")!;
        const fromSoftware = CATALOG.find((category) => category.name === "Jogo da From Software")!;
        const others = CATALOG.filter((category) => category !== nintendo && category !== fromSoftware).slice(0, 4);

        expect(() => drawCategories([...others, nintendo, fromSoftware], "qualquer")).toThrow(
            expect.objectContaining({ name: "AppError" }),
        );
    });
});
