import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../config/prisma";
import { awardValidator } from "./awardValidator";

vi.mock("../config/prisma", () => ({
    prisma: {
        game: { findFirst: vi.fn() },
        award: { findFirst: vi.fn() },
        game_award: { findFirst: vi.fn() },
    },
}));

const gameFindFirst = vi.mocked(prisma.game.findFirst);
const awardFindFirst = vi.mocked(prisma.award.findFirst);
const gameAwardFindFirst = vi.mocked(prisma.game_award.findFirst);

const GAME = { id: 1, name: "Elden Ring" };
const AWARD = { id: 7, name: "Game Of The Year" };

beforeEach(() => {
    vi.resetAllMocks();
});

describe("awardValidator", () => {
    it("aceita quando o jogo tem o prêmio", async () => {
        gameFindFirst.mockResolvedValue(GAME);
        awardFindFirst.mockResolvedValue(AWARD);
        gameAwardFindFirst.mockResolvedValue({
            game_id_fk: GAME.id,
            award_id_fk: AWARD.id,
            year: 2022,
            award: AWARD,
        } as never);

        await expect(awardValidator(GAME.name, AWARD.name)).resolves.toBe(true);
    });

    it("recusa quando o jogo não tem o prêmio", async () => {
        gameFindFirst.mockResolvedValue(GAME);
        awardFindFirst.mockResolvedValue(AWARD);
        gameAwardFindFirst.mockResolvedValue(null);

        await expect(awardValidator(GAME.name, AWARD.name)).resolves.toBe(false);
    });

    /**
     * O prêmio sai do SQLite local, mas o jogo vem da IGDB: qualquer jogo fora
     * da curadoria do banco simplesmente não pontua nessa categoria.
     */
    it("recusa quando o jogo não existe no banco", async () => {
        gameFindFirst.mockResolvedValue(null);
        awardFindFirst.mockResolvedValue(AWARD);

        await expect(awardValidator("Jogo Fora da Curadoria", AWARD.name)).resolves.toBe(false);
        expect(gameAwardFindFirst).not.toHaveBeenCalled();
    });

    /**
     * Item 8 da revisão: prêmio inexistente lança Error genérico, que o
     * errorHandler transforma em 500 opaco. É erro de dados nossos, não do
     * jogador — deveria ser AppError (ou false). Fica registrado até corrigir.
     */
    it("hoje lança Error genérico quando o prêmio não existe no banco", async () => {
        gameFindFirst.mockResolvedValue(GAME);
        awardFindFirst.mockResolvedValue(null);

        await expect(awardValidator(GAME.name, "Prêmio Inexistente")).rejects.toThrow(
            "Premiação não existe no banco de dados!",
        );
    });
});
