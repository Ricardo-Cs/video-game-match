import { prisma } from "../config/prisma";

export const awardValidator = async (answerGame: string, conditionAward: string): Promise<boolean> => {
    const [game, award] = await Promise.all([
        prisma.game.findFirst({ where: { name: answerGame } }),
        prisma.award.findFirst({ where: { name: conditionAward } })
    ]);

    if (!game) return false;

    if (!award) throw new Error('Premiação não existe no banco de dados!');

    const gameAward = await prisma.game_award.findFirst({
        where: {
            game_id_fk: game.id,
            award_id_fk: award.id
        },
        include: { award: true }
    });
    // Garante que o nome do prêmio corresponde exatamente ao solicitado
    return gameAward?.award.name === conditionAward;
};