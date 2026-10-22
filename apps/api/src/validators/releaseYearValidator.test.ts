import { describe, expect, it } from "vitest";

import { releaseYearValidator } from "./releaseYearValidator";

describe("releaseYearValidator", () => {
    it.each([
        { operator: "<", releaseYear: 1998, value: 1999, expected: true },
        { operator: "<", releaseYear: 1999, value: 1999, expected: false },
        { operator: "<=", releaseYear: 1999, value: 1999, expected: true },
        { operator: "<=", releaseYear: 2000, value: 1999, expected: false },
        { operator: ">", releaseYear: 2000, value: 1999, expected: true },
        { operator: ">", releaseYear: 1999, value: 1999, expected: false },
        { operator: ">=", releaseYear: 2020, value: 2020, expected: true },
        { operator: ">=", releaseYear: 2019, value: 2020, expected: false },
    ])("$releaseYear $operator $value → $expected", ({ operator, releaseYear, value, expected }) => {
        expect(releaseYearValidator(operator, releaseYear, value)).toBe(expected);
    });

    /**
     * O schema aceita `operator: z.string()` livre, então um operador que o
     * switch não conhece chega até aqui e vira "resposta incorreta" em
     * silêncio — é o item 5 da revisão. Enquanto for assim, fica registrado.
     */
    it.each(["==", "=", "includes", "!=", ""])(
        "operador desconhecido %j recusa em silêncio",
        (operator) => {
            expect(releaseYearValidator(operator, 2020, 2020)).toBe(false);
        },
    );
});
