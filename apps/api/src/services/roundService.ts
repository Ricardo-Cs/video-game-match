import { randomUUID } from "node:crypto";
import { z } from "zod";
import { categorySchema, type Category, type CategoryView, type CreateGuessData, type GuessResult, type RoundView } from "@vgm/contracts";
import { AppError } from "../errors/AppError";
import { getCategoriesData } from "../repositories/categoriesRepository";
import { createRound, findRoundById, recordGuess, type RoundWithGuesses } from "../repositories/roundRepository";
import { drawCategories } from "../utils/drawCategories";
import { coverUrlOf } from "../utils/igdbImages";
import { CATEGORIES_PER_ROUND, categoriesOfCell, splitIntoRowsAndColumns } from "../utils/roundGrid";
import { assertCanGuess, missedCellsOf } from "../utils/roundRules";
import { findUnmetCategories } from "../validators";
import { findGameById } from "./gameLookupService";

export const MAX_ATTEMPTS_PER_ROUND = 9;

const storedCategoriesSchema = z.array(categorySchema).length(CATEGORIES_PER_ROUND);

const categoriesOf = (round: RoundWithGuesses): Category[] => storedCategoriesSchema.parse(round.categories);

const toCategoryView = ({ name, type }: Category): CategoryView => ({ name, type });

const toRoundView = (round: RoundWithGuesses): RoundView => {
    const { rows, columns } = splitIntoRowsAndColumns(categoriesOf(round));

    return {
        id: round.id,
        status: round.status,
        rows: rows.map(toCategoryView),
        columns: columns.map(toCategoryView),
        maxAttempts: round.maxAttempts,
        attemptsUsed: round.guesses.length,
        solvedCells: round.guesses
            .filter((guess) => guess.correct)
            .map((guess) => ({
                cell: guess.cell,
                game: { id: guess.igdbGameId, name: guess.gameName, coverUrl: guess.coverUrl },
            })),
        missedCells: missedCellsOf(round.guesses),
    };
};

const findRoundOrFail = async (roundId: string): Promise<RoundWithGuesses> => {
    const round = await findRoundById(roundId);
    if (!round) throw new AppError("Rodada não encontrada.", 404);
    return round;
};

export const startRound = async (): Promise<RoundView> => {
    const seed = randomUUID();
    const categories = drawCategories(getCategoriesData().categories, seed);
    const round = await createRound({ seed, categories, maxAttempts: MAX_ATTEMPTS_PER_ROUND });

    return toRoundView(round);
};

export const getRound = async (roundId: string): Promise<RoundView> => toRoundView(await findRoundOrFail(roundId));

export const submitGuess = async (roundId: string, { cell, gameId }: CreateGuessData): Promise<GuessResult> => {
    const round = await findRoundOrFail(roundId);

    // Recusa cedo, antes de gastar uma chamada à IGDB
    assertCanGuess(round, cell, gameId);

    const game = await findGameById(gameId);
    const unmetCategories = await findUnmetCategories(game, categoriesOfCell(categoriesOf(round), cell));
    const correct = unmetCategories.length === 0;

    const updatedRound = await recordGuess(roundId, {
        cell,
        igdbGameId: gameId,
        correct,
        gameName: game.name,
        coverUrl: coverUrlOf(game),
    });

    return { correct, unmetCategories: unmetCategories.map(toCategoryView), round: toRoundView(updatedRound) };
};
