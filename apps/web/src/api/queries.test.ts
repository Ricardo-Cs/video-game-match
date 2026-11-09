import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/client';
import { isStaleRoundError } from '@/api/queries';

describe('isStaleRoundError', () => {
  it('trata o 409 como grade desatualizada', () => {
    expect(isStaleRoundError(new ApiError('Essa célula já foi resolvida.', 409))).toBe(true);
  });

  it('não recarrega a grade por outros erros da API', () => {
    expect(isStaleRoundError(new ApiError('Rodada não encontrada.', 404))).toBe(false);
    expect(isStaleRoundError(new ApiError('Erro interno do servidor', 500))).toBe(false);
  });

  it('não recarrega a grade por falha de rede', () => {
    expect(isStaleRoundError(new TypeError('Failed to fetch'))).toBe(false);
  });
});
