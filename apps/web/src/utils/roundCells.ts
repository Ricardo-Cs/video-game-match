import {
  CELL_COUNT,
  GRID_SIZE,
  type CategoryView,
  type CellIndex,
  type RoundView,
  type SolvedCell,
} from '@vgm/contracts';

export type CellState =
  | { status: 'empty' }
  | { status: 'missed' }
  | { status: 'solved'; game: SolvedCell['game'] };

type RoundCells = Pick<RoundView, 'solvedCells' | 'missedCells'>;

export function buildCellStates({ solvedCells, missedCells }: RoundCells): CellState[] {
  const solvedByCell = new Map(solvedCells.map(({ cell, game }) => [cell, game]));
  const missed = new Set(missedCells);

  return Array.from({ length: CELL_COUNT }, (_, cell): CellState => {
    const game = solvedByCell.get(cell);
    if (game) return { status: 'solved', game };
    if (missed.has(cell)) return { status: 'missed' };
    return { status: 'empty' };
  });
}

export function cellIndexAt(rowIndex: number, columnIndex: number): CellIndex {
  return rowIndex * GRID_SIZE + columnIndex;
}

export function categoriesOfCell(
  { rows, columns }: Pick<RoundView, 'rows' | 'columns'>,
  cell: CellIndex,
): [CategoryView, CategoryView] {
  return [rows[Math.floor(cell / GRID_SIZE)], columns[cell % GRID_SIZE]];
}

export function attemptsLeft({ maxAttempts, attemptsUsed }: Pick<RoundView, 'maxAttempts' | 'attemptsUsed'>): number {
  return Math.max(maxAttempts - attemptsUsed, 0);
}

export function isRoundFinished({ status }: Pick<RoundView, 'status'>): boolean {
  return status === 'FINISHED';
}

export function canGuessCell(round: Pick<RoundView, 'status'>, cellState: CellState): boolean {
  return !isRoundFinished(round) && cellState.status !== 'solved';
}

export function usedGameIdsOf({ solvedCells }: Pick<RoundView, 'solvedCells'>): Set<number> {
  return new Set(solvedCells.map(({ game }) => game.id));
}
