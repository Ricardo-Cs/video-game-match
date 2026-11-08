import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGameById } from "../integrations/igdb";
import { findFreshCachedGame, saveCachedGame } from "../repositories/gameCacheRepository";
import { GameCheckApiResponse } from "../types/types";
import { findGameById } from "./gameLookupService";

vi.mock("../integrations/igdb", () => ({ getGameById: vi.fn() }));
vi.mock("../repositories/gameCacheRepository", () => ({
    findFreshCachedGame: vi.fn(),
    saveCachedGame: vi.fn(),
}));

const GAME: GameCheckApiResponse = { id: 1942, name: "The Witcher 3: Wild Hunt" };

beforeEach(() => {
    vi.resetAllMocks();
});

describe("findGameById", () => {
    it("usa o cache quando há entrada válida, sem chamar a IGDB", async () => {
        vi.mocked(findFreshCachedGame).mockResolvedValue(GAME);

        await expect(findGameById(GAME.id)).resolves.toEqual(GAME);
        expect(getGameById).not.toHaveBeenCalled();
    });

    it("busca na IGDB e guarda no cache quando não há entrada válida", async () => {
        vi.mocked(findFreshCachedGame).mockResolvedValue(undefined);
        vi.mocked(getGameById).mockResolvedValue(GAME);

        await expect(findGameById(GAME.id)).resolves.toEqual(GAME);
        expect(saveCachedGame).toHaveBeenCalledWith(GAME, expect.any(Date));
    });

    it("guarda no cache com validade no futuro", async () => {
        vi.mocked(findFreshCachedGame).mockResolvedValue(undefined);
        vi.mocked(getGameById).mockResolvedValue(GAME);

        await findGameById(GAME.id);

        const expiresAt = vi.mocked(saveCachedGame).mock.calls[0][1];
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("lança AppError 404 quando a IGDB não conhece o jogo", async () => {
        vi.mocked(findFreshCachedGame).mockResolvedValue(undefined);
        vi.mocked(getGameById).mockResolvedValue(undefined);

        await expect(findGameById(999)).rejects.toMatchObject({ name: "AppError", statusCode: 404 });
        expect(saveCachedGame).not.toHaveBeenCalled();
    });
});
