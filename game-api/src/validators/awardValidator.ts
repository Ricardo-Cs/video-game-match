import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";

export const awardValidator = async (answerGame: string, conditionAward: string): Promise<boolean> => {
    const [game, award] = await Promise.all([
        prisma.game.findFirst({ where: { name: answerGame } }),
        prisma.award.findFirst({ where: { name: conditionAward } })
    ]);

    if (!game) return false;

    // Enquanto o cliente envia as categorias, um prêmio desconhecido é erro da requisição
    if (!award) throw new AppError(`Premiação inexistente: ${conditionAward}`, 400);

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