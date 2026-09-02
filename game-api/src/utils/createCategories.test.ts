import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { CategoriesData, Category } from "../types/types";
import { createCategories } from "./createCategories";

const REAL_DATA: CategoriesData = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "src/data/data.json"), "utf-8"),
);

// Espelha os pares de utils/createCategories.ts. Duplicado de propósito: se a
// lista de lá mudar sem que esta acompanhe, o teste de incompatibilidade para
// de cobrir o par novo e isso precisa doer.
const INCOMPATIBLE_PAIRS = [
    ["Jogo da Nintendo", "Jogo da From Software"],
    ["Lançado depois de 1999", "Lançado antes de 1999"],
    ["Lançado em 2020 ou depois", "Lançado antes de 1999"],
];

const ROUNDS = 200;

const names = (categories: Category[]) => categories.map((category) => category.name);

describe("createCategories", () => {
    it("sorteia exatamente 6 categorias", () => {
        expect(createCategories(REAL_DATA)).toHaveLength(6);
    });

    it("nunca repete categoria na mesma rodada", () => {
        for (let round = 0; round < ROUNDS; round++) {
            const selected = names(createCategories(REAL_DATA));
            expect(new Set(selected).size).toBe(selected.length);
        }
    });

    it("nunca sorteia um par incompatível", () => {
        for (let round = 0; round < ROUNDS; round++) {
            const selected = names(createCategories(REAL_DATA));

            for (const [first, second] of INCOMPATIBLE_PAIRS) {
                expect(
                    selected.includes(first) && selected.includes(second),
                    `rodada com par incompatível: ${first} + ${second}`,
                ).toBe(false);
            }
        }
    });

    it("sorteia de verdade: rodadas diferentes saem diferentes", () => {
        const rounds = Array.from({ length: 20 }, () => names(createCategories(REAL_DATA)).sort().join("|"));

        expect(new Set(rounds).size).toBeGreaterThan(1);
    });

    it("só devolve categorias que existem no data.json", () => {
        const known = new Set(names(REAL_DATA.categories));

        for (const name of names(createCategories(REAL_DATA))) {
            expect(known).toContain(name);
        }
    });

    /**
     * Item 8 da revisão: o `while` sorteia índice aleatório sem limite de
     * iterações. Com menos de 6 categorias compatíveis disponíveis ele roda
     * para sempre — o teste abaixo trava o processo hoje, por isso está skip.
     * Habilitar junto com a troca por "embaralhar e pegar os 6 primeiros".
     */
    it.skip("termina quando não há 6 categorias possíveis (hoje entra em loop infinito)", () => {
        const poucasCategorias: CategoriesData = {
            categories: REAL_DATA.categories.slice(0, 3),
        };

        expect(() => createCategories(poucasCategorias)).toThrow();
    });
});
