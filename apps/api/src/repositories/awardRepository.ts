import { prisma } from "../config/prisma";

// Nome do prêmio → ids na IGDB dos jogos que o venceram
export const findAwardWinnerIds = async (): Promise<Map<string, number[]>> => {
    const awards = await prisma.award.findMany({
        select: { name: true, gameAward: { select: { game: { select: { igdbId: true } } } } },
    });

    return new Map(awards.map((award) => [award.name, award.gameAward.map(({ game }) => game.igdbId)]));
};
