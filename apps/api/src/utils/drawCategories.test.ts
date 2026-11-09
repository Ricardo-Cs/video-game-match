import { describe, expect, it } from "vitest";

import type { Category } from "@vgm/contracts";
import { drawCategories, type CountAnswers } from "./drawCategories";
import { CATEGORIES_PER_ROUND, splitIntoRowsAndColumns } from "./roundGrid";

const genre = (name: string, id: number): Category => ({ name, type: "genre", condition: { ids: [id] } });

const CATALOG = Array.from({ length: 12 }, (_, index) => genre(`categoria${index}`, index + 1));

const SEEDS = Array.from({ length: 100 }, (_, index) => `seed-${index}`);

const pairKey = (first: string, second: string) => [first, second].sort().join("|");

const SINGLE_CATEGORY_ANSWERS = 1000;
const DEFAULT_CELL_ANSWERS = 50;

// Mundo falso: cada categoria tem 1000 jogos, cada par 50, salvo os pares listados
const fakeCounter = (cellAnswers: Record<string, number> = {}): CountAnswers => async (groups) =>
    groups.map((group) => {
        if (group.length === 1) return SINGLE_CATEGORY_ANSWERS;
        return cellAnswers[pairKey(group[0].name, group[1].name)] ?? DEFAULT_CELL_ANSWERS;
    });

const cellsOf = (categories: Category[]) => {
    const { rows, columns } = splitIntoRowsAndColumns(categories);
    return rows.flatMap((row) => columns.map((column) => pairKey(row.name, column.name)));
};

const namesOf = (categories: Category[]) => categories.map((category) => category.name);

describe("drawCategories", () => {
    it(`sorteia ${CATEGORIES_PER_ROUND} categorias distintas`, async () => {
        const drawn = await drawCategories(CATALOG, "qualquer", fakeCounter());

        expect(drawn).toHaveLength(CATEGORIES_PER_ROUND);
        expect(new Set(namesOf(drawn)).size).toBe(CATEGORIES_PER_ROUND);
    });

    it("sorteia a mesma grade para a mesma seed", async () => {
        const first = await drawCategories(CATALOG, "grade-do-dia", fakeCounter());
        const second = await drawCategories(CATALOG, "grade-do-dia", fakeCounter());

        expect(first).toEqual(second);
    });

    it("sorteia grades diferentes para seeds diferentes", async () => {
        const grids = await Promise.all(
            SEEDS.map(async (seed) => namesOf(await drawCategories(CATALOG, seed, fakeCounter())).join("|")),
        );

        expect(new Set(grids).size).toBeGreaterThan(1);
    });

    it("nunca cruza categorias cuja célula teria poucas respostas", async () => {
        const unsolvable = {
            [pairKey("categoria0", "categoria1")]: 0,
            [pairKey("categoria2", "categoria3")]: 2,
            [pairKey("categoria4", "categoria5")]: 1,
        };

        for (const seed of SEEDS) {
            const cells = cellsOf(await drawCategories(CATALOG, seed, fakeCounter(unsolvable)));

            for (const pair of Object.keys(unsolvable)) {
                expect(cells, `seed ${seed} cruzou ${pair}`).not.toContain(pair);
            }
        }
    });

    it("nunca cruza categorias em que uma implica a outra", async () => {
        const implied = { [pairKey("categoria6", "categoria7")]: SINGLE_CATEGORY_ANSWERS };

        for (const seed of SEEDS) {
            const cells = cellsOf(await drawCategories(CATALOG, seed, fakeCounter(implied)));

            expect(cells, `seed ${seed} cruzou categoria6 com categoria7`).not.toContain(
                pairKey("categoria6", "categoria7"),
            );
        }
    });

    it("permite as duas categorias de um par sem resposta no mesmo eixo, onde não se cruzam", async () => {
        const fourCategories = CATALOG.slice(0, 6);
        const onlyPairWithoutAnswers = { [pairKey("categoria0", "categoria1")]: 0 };

        const drawn = await drawCategories(fourCategories, "qualquer", fakeCounter(onlyPairWithoutAnswers));

        expect(namesOf(drawn).sort()).toEqual(namesOf(fourCategories).sort());
        expect(cellsOf(drawn)).not.toContain(pairKey("categoria0", "categoria1"));
    });

    it("lança AppError quando o catálogo não tem categorias suficientes", async () => {
        await expect(drawCategories(CATALOG.slice(0, 3), "qualquer", fakeCounter())).rejects.toMatchObject({
            name: "AppError",
        });
    });

    it("lança AppError quando nenhuma combinação forma células jogáveis", async () => {
        const noAnswers: CountAnswers = async (groups) => groups.map((group) => (group.length === 1 ? 1000 : 0));

        await expect(drawCategories(CATALOG, "qualquer", noAnswers)).rejects.toMatchObject({ name: "AppError" });
    });
});
