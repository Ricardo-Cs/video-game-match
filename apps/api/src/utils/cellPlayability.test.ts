import { describe, expect, it } from "vitest";

import { isPlayableCell, MIN_ANSWERS_PER_CELL } from "./cellPlayability";

describe("isPlayableCell", () => {
    it("aceita célula com respostas suficientes que exige as duas categorias", () => {
        expect(isPlayableCell({ cell: 40, row: 500, column: 900 })).toBe(true);
    });

    it("recusa célula sem resposta", () => {
        expect(isPlayableCell({ cell: 0, row: 500, column: 900 })).toBe(false);
    });

    it(`recusa célula com menos de ${MIN_ANSWERS_PER_CELL} respostas`, () => {
        expect(isPlayableCell({ cell: MIN_ANSWERS_PER_CELL - 1, row: 500, column: 900 })).toBe(false);
        expect(isPlayableCell({ cell: MIN_ANSWERS_PER_CELL, row: 500, column: 900 })).toBe(true);
    });

    it("recusa célula em que uma categoria implica a outra", () => {
        // Todo jogo coop também conta como multiplayer
        expect(isPlayableCell({ cell: 300, row: 300, column: 900 })).toBe(false);
        expect(isPlayableCell({ cell: 900, row: 1200, column: 900 })).toBe(false);
    });
});
