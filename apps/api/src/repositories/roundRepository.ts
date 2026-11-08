import type { Category } from "@vgm/contracts";
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { assertCanGuess, isRoundOver } from "../utils/roundRules";

const withGuesses = {
    guesses: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.RoundInclude;

export type RoundWithGuesses = Prisma.RoundGetPayload<{ include: typeof withGuesses }>;

export interface NewRound {
    seed: string;
    categories: Category[];
    maxAttempts: number;
}

export interface NewGuess {
    cell: number;
    igdbGameId: number;
    correct: boolean;
    gameName: string;
    coverUrl: string | null;
}

export const createRound = (round: NewRound): Promise<RoundWithGuesses> =>
    prisma.round.create({
        data: { ...round, categories: round.categories as unknown as Prisma.InputJsonArray },
        include: withGuesses,
    });

export const findRoundById = (id: string): Promise<RoundWithGuesses | null> =>
    prisma.round.findUnique({ where: { id }, include: withGuesses });

// O palpite é validado na IGDB fora da transação (lento). Aqui a rodada é travada e as
// regras conferidas de novo, para que palpites simultâneos não furem o limite de tentativas.
export const recordGuess = (roundId: string, guess: NewGuess): Promise<RoundWithGuesses> =>
    prisma.$transaction(async (transaction) => {
        await transaction.$queryRaw`SELECT id FROM rounds WHERE id = ${roundId}::uuid FOR UPDATE`;

        const round = await transaction.round.findUniqueOrThrow({ where: { id: roundId }, include: withGuesses });
        assertCanGuess(round, guess.cell, guess.igdbGameId);

        await transaction.guess.create({ data: { ...guess, roundId } });

        const guessesAfter = [...round.guesses, guess];
        if (isRoundOver(round.maxAttempts, guessesAfter)) {
            await transaction.round.update({
                where: { id: roundId },
                data: { status: "FINISHED", finishedAt: new Date() },
            });
        }

        return transaction.round.findUniqueOrThrow({ where: { id: roundId }, include: withGuesses });
    });
