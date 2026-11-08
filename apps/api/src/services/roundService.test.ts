import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@vgm/contracts";
import { createRound, findRoundById, recordGuess, type RoundWithGuesses } from "../repositories/roundRepository";
import { matchesAllCategories } from "../validators";
import { findGameById } from "./gameLookupService";
import { getRound, MAX_ATTEMPTS_PER_ROUND, startRound, submitGuess } from "./roundService";

vi.mock("../repositories/roundRepository", () => ({
    createRound: vi.fn(),
    findRoundById: vi.fn(),
    recordGuess: vi.fn(),
}));
vi.mock("../validators", () => ({ matchesAllCategories: vi.fn() }));
vi.mock("./gameLookupService", () => ({ findGameById: vi.fn() }));

const ROUND_ID = "0193a5b2-0000-7000-8000-000000000001";

const categoryNamed = (name: string): Category => ({
    name,
    type: "genre",
    condition: { field: "genre", operator: "includes", value: name },
});

const CATEGORIES = ["linha0", "linha1", "linha2", "coluna0", "coluna1", "coluna2"].map(categoryNamed);

const GAME = {
    id: 1942,
    name: "The Witcher 3: Wild Hunt",
    cover: { id: 1, url: "//images.igdb.com/igdb/image/upload/t_thumb/co1.jpg" },
};

type StoredGuess = RoundWithGuesses["guesses"][number];

const storedGuess = (cell: number, igdbGameId: number, correct: boolean): StoredGuess => ({
    id: `guess-${cell}-${igdbGameId}`,
    roundId: ROUND_ID,
    cell,
    igdbGameId,
    correct,
    gameName: `Jogo ${igdbGameId}`,
    coverUrl: null,
    createdAt: new Date(),
});

const storedRound = (overrides: Partial<RoundWithGuesses> = {}): RoundWithGuesses => ({
    id: ROUND_ID,
    seed: "seed",
    categories: CATEGORIES,
    maxAttempts: MAX_ATTEMPTS_PER_ROUND,
    status: "IN_PROGRESS",
    createdAt: new Date(),
    updatedAt: new Date(),
    finishedAt: null,
    guesses: [],
    ...overrides,
});

beforeEach(() => {
    vi.resetAllMocks();
});

describe("startRound", () => {
    it("guarda a seed e as categorias sorteadas, com o limite de tentativas", async () => {
        vi.mocked(createRound).mockImplementation(async (round) =>
            storedRound({ seed: round.seed, categories: round.categories }),
        );

        const view = await startRound();

        const saved = vi.mocked(createRound).mock.calls[0][0];
        expect(saved.seed).toEqual(expect.any(String));
        expect(saved.categories).toHaveLength(6);
        expect(saved.maxAttempts).toBe(MAX_ATTEMPTS_PER_ROUND);
        expect(view.rows).toHaveLength(3);
        expect(view.columns).toHaveLength(3);
    });

    it("não expõe a condição das categorias ao cliente", async () => {
        vi.mocked(createRound).mockImplementation(async (round) => storedRound({ categories: round.categories }));

        const view = await startRound();

        for (const category of [...view.rows, ...view.columns]) {
            expect(Object.keys(category).sort()).toEqual(["name", "type"]);
        }
    });
});

describe("getRound", () => {
    it("monta a grade com tentativas usadas e só as células acertadas", async () => {
        vi.mocked(findRoundById).mockResolvedValue(
            storedRound({ guesses: [storedGuess(0, 10, true), storedGuess(1, 20, false)] }),
        );

        const view = await getRound(ROUND_ID);

        expect(view.rows.map((category) => category.name)).toEqual(["linha0", "linha1", "linha2"]);
        expect(view.columns.map((category) => category.name)).toEqual(["coluna0", "coluna1", "coluna2"]);
        expect(view.attemptsUsed).toBe(2);
        expect(view.solvedCells).toEqual([{ cell: 0, game: { id: 10, name: "Jogo 10", coverUrl: null } }]);
    });

    it("lança AppError 404 para rodada inexistente", async () => {
        vi.mocked(findRoundById).mockResolvedValue(null);

        await expect(getRound(ROUND_ID)).rejects.toMatchObject({ name: "AppError", statusCode: 404 });
    });
});

describe("submitGuess", () => {
    beforeEach(() => {
        vi.mocked(findRoundById).mockResolvedValue(storedRound());
        vi.mocked(findGameById).mockResolvedValue(GAME);
        vi.mocked(recordGuess).mockResolvedValue(storedRound());
    });

    it("valida o jogo só contra a linha e a coluna da célula", async () => {
        vi.mocked(matchesAllCategories).mockResolvedValue(true);

        await submitGuess(ROUND_ID, { cell: 5, gameId: GAME.id });

        const [, categories] = vi.mocked(matchesAllCategories).mock.calls[0];
        expect(categories.map((category) => category.name)).toEqual(["linha1", "coluna2"]);
    });

    it("registra o palpite certo com nome e capa do jogo", async () => {
        vi.mocked(matchesAllCategories).mockResolvedValue(true);

        const result = await submitGuess(ROUND_ID, { cell: 0, gameId: GAME.id });

        expect(result.correct).toBe(true);
        expect(recordGuess).toHaveBeenCalledWith(ROUND_ID, {
            cell: 0,
            igdbGameId: GAME.id,
            correct: true,
            gameName: GAME.name,
            coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg",
        });
    });

    it("registra o palpite errado, que também gasta tentativa", async () => {
        vi.mocked(matchesAllCategories).mockResolvedValue(false);

        const result = await submitGuess(ROUND_ID, { cell: 0, gameId: GAME.id });

        expect(result.correct).toBe(false);
        expect(recordGuess).toHaveBeenCalledWith(ROUND_ID, expect.objectContaining({ correct: false }));
    });

    it("recusa jogada inválida antes de consultar a IGDB", async () => {
        vi.mocked(findRoundById).mockResolvedValue(storedRound({ status: "FINISHED" }));

        await expect(submitGuess(ROUND_ID, { cell: 0, gameId: GAME.id })).rejects.toMatchObject({ statusCode: 409 });
        expect(findGameById).not.toHaveBeenCalled();
        expect(recordGuess).not.toHaveBeenCalled();
    });

    it("lança AppError 404 para rodada inexistente", async () => {
        vi.mocked(findRoundById).mockResolvedValue(null);

        await expect(submitGuess(ROUND_ID, { cell: 0, gameId: GAME.id })).rejects.toMatchObject({ statusCode: 404 });
    });

    it("falha alto se as categorias guardadas estiverem corrompidas", async () => {
        vi.mocked(findRoundById).mockResolvedValue(storedRound({ categories: CATEGORIES.slice(0, 2) }));

        await expect(submitGuess(ROUND_ID, { cell: 0, gameId: GAME.id })).rejects.toThrow();
        expect(recordGuess).not.toHaveBeenCalled();
    });
});
