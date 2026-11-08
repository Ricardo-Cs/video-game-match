import { describe, expect, it } from 'vitest';

import type { CategoryView } from '@vgm/contracts';

import { buildGuessFeedback } from '@/utils/guessFeedback';

const indieAward: CategoryView = { name: 'Vencedor de Melhor Jogo Indie', type: 'award' };
const withDlcs: CategoryView = { name: 'Com DLCS', type: 'dlcs' };
const CELL = [indieAward, withDlcs] as const;

describe('buildGuessFeedback', () => {
  it('no acerto, cita as duas categorias da célula', () => {
    const feedback = buildGuessFeedback('Cuphead', { correct: true, unmetCategories: [] }, CELL);

    expect(feedback).toEqual({
      isCorrect: true,
      message: 'Acertou! Cuphead vale para Vencedor de Melhor Jogo Indie × Com DLCS.',
    });
  });

  it('no erro, cita só a categoria que o jogo não atendeu', () => {
    const feedback = buildGuessFeedback('Dave the Diver', { correct: false, unmetCategories: [indieAward] }, CELL);

    expect(feedback).toEqual({
      isCorrect: false,
      message: 'Dave the Diver não atende a Vencedor de Melhor Jogo Indie.',
    });
  });

  it('no erro em ambas, cita as duas categorias', () => {
    const feedback = buildGuessFeedback(
      'Tetris',
      { correct: false, unmetCategories: [indieAward, withDlcs] },
      CELL,
    );

    expect(feedback.message).toBe('Tetris não atende a Vencedor de Melhor Jogo Indie nem a Com DLCS.');
  });
});
