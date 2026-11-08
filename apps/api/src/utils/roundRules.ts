import { CELL_COUNT, type CellIndex, type RoundStatus } from "@vgm/contracts";
import { AppError } from "../errors/AppError";

export interface GuessRecord {
    cell: number;
    igdbGameId: number;
    correct: boolean;
}

export interface RoundState {
    status: RoundStatus;
    maxAttempts: number;
    guesses: readonly GuessRecord[];
}

const correctGuesses = (guesses: readonly GuessRecord[]) => guesses.filter((guess) => guess.correct);

export const isRoundOver = (maxAttempts: number, guesses: readonly GuessRecord[]): boolean =>
    guesses.length >= maxAttempts || correctGuesses(guesses).length === CELL_COUNT;

// Palpite recusado aqui não gasta tentativa: o jogador só errou a jogada, não o jogo
export const assertCanGuess = (round: RoundState, cell: CellIndex, igdbGameId: number): void => {
    if (round.status === "FINISHED" || isRoundOver(round.maxAttempts, round.guesses)) {
        throw new AppError("A rodada já terminou.", 409);
    }

    const solved = correctGuesses(round.guesses);

    if (solved.some((guess) => guess.cell === cell)) {
        throw new AppError("Essa célula já foi resolvida.", 409);
    }

    if (solved.some((guess) => guess.igdbGameId === igdbGameId)) {
        throw new AppError("Esse jogo já foi usado em outra célula.", 409);
    }
};
