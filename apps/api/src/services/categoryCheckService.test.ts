import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@vgm/contracts";
import { checkGameAgainstFilters, countGamesMatching } from "../integrations/igdb";
import { findAwardWinnerIds } from "../repositories/awardRepository";
import {
    checkGameAgainstCategories,
    clearAnswerCountCache,
    createAnswerCounter,
    loadFilterContext,
} from "./categoryCheckService";

vi.mock("../integrations/igdb", () => ({
    PLAYABLE_GAME_TYPES_FILTER: "game_type = (0)",
    checkGameAgainstFilters: vi.fn(),
    countGamesMatching: vi.fn(),
}));
vi.mock("../repositories/awardRepository", () => ({ findAwardWinnerIds: vi.fn() }));

const RPG: Category = { name: "Gênero: RPG", type: "genre", condition: { ids: [12] } };
const PS2: Category = { name: "Jogo de PlayStation 2", type: "platform", condition: { ids: [8] } };
const GOTY: Category = { name: "Vencedor de Melhor Jogo do Ano", type: "award", condition: { award: "Game Of The Year" } };

const CONTEXT = { awardWinnerIds: new Map([["Game Of The Year", [1942]]]) };

beforeEach(() => {
    vi.resetAllMocks();
    clearAnswerCountCache();
    vi.mocked(findAwardWinnerIds).mockResolvedValue(new Map(CONTEXT.awardWinnerIds));
});

describe("loadFilterContext", () => {
    it("traz os vencedores de prêmios do banco", async () => {
        await expect(loadFilterContext()).resolves.toEqual(CONTEXT);
    });
});

describe("createAnswerCounter", () => {
    it("conta cada grupo exigindo todas as categorias e só tipos de jogo jogáveis", async () => {
        vi.mocked(countGamesMatching).mockResolvedValue([120, 7]);

        const counts = await createAnswerCounter(CONTEXT)([[RPG], [RPG, PS2]]);

        expect(counts).toEqual([120, 7]);
        expect(countGamesMatching).toHaveBeenCalledWith([
            "(genres = (12)) & game_type = (0)",
            "(genres = (12)) & (platforms = (8)) & game_type = (0)",
        ]);
    });

    it("reaproveita contagens já feitas, sem importar a ordem das categorias", async () => {
        vi.mocked(countGamesMatching).mockResolvedValueOnce([7]).mockResolvedValueOnce([300]);
        const countAnswers = createAnswerCounter(CONTEXT);

        await countAnswers([[RPG, PS2]]);
        const counts = await countAnswers([[PS2, RPG], [GOTY]]);

        expect(counts).toEqual([7, 300]);
        expect(countGamesMatching).toHaveBeenLastCalledWith([
            "((id = (1942) | version_parent = (1942))) & game_type = (0)",
        ]);
    });

    it("não consulta a IGDB quando tudo já está em cache", async () => {
        vi.mocked(countGamesMatching).mockResolvedValueOnce([7]);
        const countAnswers = createAnswerCounter(CONTEXT);

        await countAnswers([[RPG]]);
        await expect(countAnswers([[RPG]])).resolves.toEqual([7]);
        expect(countGamesMatching).toHaveBeenCalledTimes(1);
    });

    it("conta uma vez só o grupo repetido na mesma chamada", async () => {
        vi.mocked(countGamesMatching).mockResolvedValueOnce([7]);

        const counts = await createAnswerCounter(CONTEXT)([[RPG], [RPG]]);

        expect(counts).toEqual([7, 7]);
        expect(countGamesMatching).toHaveBeenCalledWith(["(genres = (12)) & game_type = (0)"]);
    });

    it("faz sorteios simultâneos esperarem a mesma contagem em vez de repeti-la", async () => {
        vi.mocked(countGamesMatching).mockResolvedValueOnce([7]);
        const countAnswers = createAnswerCounter(CONTEXT);

        const counts = await Promise.all([countAnswers([[RPG]]), countAnswers([[RPG]])]);

        expect(counts).toEqual([[7], [7]]);
        expect(countGamesMatching).toHaveBeenCalledTimes(1);
    });

    it("não guarda em cache a contagem que falhou", async () => {
        vi.mocked(countGamesMatching).mockRejectedValueOnce(new Error("IGDB fora")).mockResolvedValueOnce([7]);
        const countAnswers = createAnswerCounter(CONTEXT);

        await expect(countAnswers([[RPG]])).rejects.toThrow("IGDB fora");
        await expect(countAnswers([[RPG]])).resolves.toEqual([7]);
    });

    it("conta de novo o prêmio quando os vencedores no banco mudam", async () => {
        vi.mocked(countGamesMatching).mockResolvedValueOnce([1]).mockResolvedValueOnce([2]);
        const withNewWinner = { awardWinnerIds: new Map([["Game Of The Year", [1942, 119133]]]) };

        await createAnswerCounter(CONTEXT)([[GOTY]]);
        const counts = await createAnswerCounter(withNewWinner)([[GOTY]]);

        expect(counts).toEqual([2]);
        expect(countGamesMatching).toHaveBeenLastCalledWith([
            "((id = (1942,119133) | version_parent = (1942,119133))) & game_type = (0)",
        ]);
    });
});

describe("checkGameAgainstCategories", () => {
    const GAME = { id: 1942, name: "The Witcher 3: Wild Hunt" };

    it("devolve o jogo e só as categorias que ele não atende", async () => {
        vi.mocked(checkGameAgainstFilters).mockResolvedValue({ game: GAME, matchesPerFilter: [true, false] });

        const result = await checkGameAgainstCategories(GAME.id, [RPG, PS2]);

        expect(result).toEqual({ game: GAME, unmetCategories: [PS2] });
        expect(checkGameAgainstFilters).toHaveBeenCalledWith(GAME.id, ["(genres = (12))", "(platforms = (8))"]);
    });

    it("lança AppError 404 quando a IGDB não conhece o jogo", async () => {
        vi.mocked(checkGameAgainstFilters).mockResolvedValue({ game: undefined, matchesPerFilter: [false, false] });

        await expect(checkGameAgainstCategories(999, [RPG, PS2])).rejects.toMatchObject({
            name: "AppError",
            statusCode: 404,
        });
    });
});
