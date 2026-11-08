import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { GameCheckApiResponse } from "../types/types";

export const findFreshCachedGame = async (igdbGameId: number): Promise<GameCheckApiResponse | undefined> => {
    const entry = await prisma.gameCache.findFirst({
        where: { igdbGameId, expiresAt: { gt: new Date() } },
    });

    return entry ? (entry.data as unknown as GameCheckApiResponse) : undefined;
};

export const saveCachedGame = async (game: GameCheckApiResponse, expiresAt: Date): Promise<void> => {
    const data = game as unknown as Prisma.InputJsonObject;

    await prisma.gameCache.upsert({
        where: { igdbGameId: game.id },
        create: { igdbGameId: game.id, data, expiresAt },
        update: { data, expiresAt, fetchedAt: new Date() },
    });
};
