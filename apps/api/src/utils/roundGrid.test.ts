import { describe, expect, it } from "vitest";

import type { Category } from "@vgm/contracts";
import { categoriesOfCell, splitIntoRowsAndColumns } from "./roundGrid";

const categoryNamed = (name: string): Category => ({
    name,
    type: "genre",
    condition: { field: "genre", operator: "includes", value: name },
});

const CATEGORIES = ["linha0", "linha1", "linha2", "coluna0", "coluna1", "coluna2"].map(categoryNamed);

describe("splitIntoRowsAndColumns", () => {
    it("separa as três primeiras como linhas e as três seguintes como colunas", () => {
        const { rows, columns } = splitIntoRowsAndColumns(CATEGORIES);

        expect(rows.map((category) => category.name)).toEqual(["linha0", "linha1", "linha2"]);
        expect(columns.map((category) => category.name)).toEqual(["coluna0", "coluna1", "coluna2"]);
    });
});

describe("categoriesOfCell", () => {
    it.each([
        { cell: 0, row: "linha0", column: "coluna0" },
        { cell: 2, row: "linha0", column: "coluna2" },
        { cell: 4, row: "linha1", column: "coluna1" },
        { cell: 5, row: "linha1", column: "coluna2" },
        { cell: 6, row: "linha2", column: "coluna0" },
        { cell: 8, row: "linha2", column: "coluna2" },
    ])("célula $cell cruza $row com $column", ({ cell, row, column }) => {
        const [rowCategory, columnCategory] = categoriesOfCell(CATEGORIES, cell);

        expect(rowCategory.name).toBe(row);
        expect(columnCategory.name).toBe(column);
    });
});
