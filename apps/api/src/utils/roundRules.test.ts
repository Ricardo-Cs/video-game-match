import { describe, expect, it } from "vitest";

import { assertCanGuess, isRoundOver, type GuessRecord, type RoundState } from "./roundRules";

const correct = (cell: number, igdbGameId: number): GuessRecord => ({ cell, igdbGameId, correct: true });
const wrong = (cell: number, igdbGameId: number): GuessRecord => ({ cell, igdbGameId, correct: false });

const roundWith = (guesses: GuessRecord[], overrides: Partial<RoundState> = {}): RoundState => ({
    status: "IN_PROGRESS",
    maxAttempts: 9,
    guesses,
    ...overrides,
});

const expectConflict = (action: () => void, message: string) => {
    expect(action).toThrow(expect.objectContaining({ name: "AppError", statusCode: 409, message }));
};

describe("isRoundOver", () => {
    it("continua enquanto há tentativas e células livres", () => {
        expect(isRoundOver(9, [correct(0, 1), wrong(1, 2)])).toBe(false);
    });

    it("termina quando as tentativas acabam", () => {
        expect(isRoundOver(2, [correct(0, 1), wrong(1, 2)])).toBe(true);
    });

    it("termina quando as nove células são resolvidas", () => {
        const allCells = Array.from({ length: 9 }, (_, cell) => correct(cell, cell + 100));

        expect(isRoundOver(20, allCells)).toBe(true);
    });
});

describe("assertCanGuess", () => {
    it("aceita palpite em célula livre com jogo inédito", () => {
        expect(() => assertCanGuess(roundWith([correct(0, 1)]), 1, 2)).not.toThrow();
    });

    it("aceita tentar de novo uma célula que só teve erros", () => {
        expect(() => assertCanGuess(roundWith([wrong(0, 1)]), 0, 2)).not.toThrow();
    });

    it("aceita repetir um jogo que só foi usado em palpite errado", () => {
        expect(() => assertCanGuess(roundWith([wrong(0, 1)]), 1, 1)).not.toThrow();
    });

    it("recusa rodada encerrada", () => {
        expectConflict(() => assertCanGuess(roundWith([], { status: "FINISHED" }), 0, 1), "A rodada já terminou.");
    });

    it("recusa quando as tentativas acabaram, mesmo sem a rodada marcada como encerrada", () => {
        expectConflict(
            () => assertCanGuess(roundWith([wrong(0, 1)], { maxAttempts: 1 }), 1, 2),
            "A rodada já terminou.",
        );
    });

    it("recusa célula já resolvida", () => {
        expectConflict(() => assertCanGuess(roundWith([correct(0, 1)]), 0, 2), "Essa célula já foi resolvida.");
    });

    it("recusa jogo que já resolveu outra célula", () => {
        expectConflict(
            () => assertCanGuess(roundWith([correct(0, 1)]), 1, 1),
            "Esse jogo já foi usado em outra célula.",
        );
    });
});
