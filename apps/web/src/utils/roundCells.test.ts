import { describe, expect, it } from 'vitest';

import type { CategoryView, SolvedCell } from '@vgm/contracts';

import {
  attemptsLeft,
  buildCellStates,
  canGuessCell,
  categoriesOfCell,
  cellIndexAt,
  usedGameIdsOf,
} from '@/utils/roundCells';

const solvedCell = (cell: number, gameId: number): SolvedCell => ({
  cell,
  game: { id: gameId, name: `Jogo ${gameId}`, coverUrl: null },
});

const categoryNamed = (name: string): CategoryView => ({ name, type: 'genre' });

describe('buildCellStates', () => {
  it('monta as nove células, vazias quando não há palpites', () => {
    const states = buildCellStates({ solvedCells: [], missedCells: [] });

    expect(states).toHaveLength(9);
    expect(states.every((state) => state.status === 'empty')).toBe(true);
  });

  it('marca células acertadas com o jogo e células erradas como erro', () => {
    const states = buildCellStates({ solvedCells: [solvedCell(0, 10)], missedCells: [4] });

    expect(states[0]).toEqual({ status: 'solved', game: solvedCell(0, 10).game });
    expect(states[4]).toEqual({ status: 'missed' });
    expect(states[8]).toEqual({ status: 'empty' });
  });

  it('dá prioridade ao acerto se a célula aparecer nas duas listas', () => {
    const states = buildCellStates({ solvedCells: [solvedCell(2, 10)], missedCells: [2] });

    expect(states[2].status).toBe('solved');
  });
});

describe('cellIndexAt', () => {
  it.each([
    { row: 0, column: 0, cell: 0 },
    { row: 0, column: 2, cell: 2 },
    { row: 1, column: 1, cell: 4 },
    { row: 2, column: 2, cell: 8 },
  ])('linha $row e coluna $column formam a célula $cell', ({ row, column, cell }) => {
    expect(cellIndexAt(row, column)).toBe(cell);
  });
});

describe('categoriesOfCell', () => {
  it('cruza a linha e a coluna da célula', () => {
    const round = {
      rows: ['linha0', 'linha1', 'linha2'].map(categoryNamed),
      columns: ['coluna0', 'coluna1', 'coluna2'].map(categoryNamed),
    };

    const [row, column] = categoriesOfCell(round, 5);

    expect(row.name).toBe('linha1');
    expect(column.name).toBe('coluna2');
  });
});

describe('attemptsLeft', () => {
  it('desconta as tentativas usadas do limite', () => {
    expect(attemptsLeft({ maxAttempts: 9, attemptsUsed: 4 })).toBe(5);
  });

  it('nunca fica negativo', () => {
    expect(attemptsLeft({ maxAttempts: 9, attemptsUsed: 12 })).toBe(0);
  });
});

describe('canGuessCell', () => {
  it('permite palpite em célula vazia ou errada de rodada em andamento', () => {
    expect(canGuessCell({ status: 'IN_PROGRESS' }, { status: 'empty' })).toBe(true);
    expect(canGuessCell({ status: 'IN_PROGRESS' }, { status: 'missed' })).toBe(true);
  });

  it('bloqueia célula já resolvida', () => {
    const solved = { status: 'solved', game: solvedCell(0, 10).game } as const;

    expect(canGuessCell({ status: 'IN_PROGRESS' }, solved)).toBe(false);
  });

  it('bloqueia qualquer célula de rodada encerrada', () => {
    expect(canGuessCell({ status: 'FINISHED' }, { status: 'empty' })).toBe(false);
  });
});

describe('usedGameIdsOf', () => {
  it('reúne os jogos que já resolveram alguma célula', () => {
    expect(usedGameIdsOf({ solvedCells: [solvedCell(0, 10), solvedCell(3, 20)] })).toEqual(new Set([10, 20]));
  });
});
