import type { CreateGuessInput } from '@vgm/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import { getRound, searchGames, startRound, submitGuess } from '@/api/game';

const HTTP_CONFLICT = 409;

export const gameKeys = {
  all: ['game'] as const,
  search: (search: string) => [...gameKeys.all, 'search', search] as const,
};

export const roundKeys = {
  all: ['round'] as const,
  detail: (roundId: string) => [...roundKeys.all, roundId] as const,
};

export const MIN_SEARCH_LENGTH = 3;

// A IGDB tem rate limit de ~4 req/s; o cache por termo evita repetir chamadas enquanto o jogador corrige o texto
export function useGameSearchQuery(search: string) {
  const term = search.trim();

  return useQuery({
    queryKey: gameKeys.search(term),
    queryFn: ({ signal }) => searchGames(term, signal),
    enabled: term.length >= MIN_SEARCH_LENGTH,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStartRoundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startRound,
    onSuccess: (round) => queryClient.setQueryData(roundKeys.detail(round.id), round),
  });
}

// A rodada só muda pelos palpites do próprio jogador, que já atualizam o cache
export function useRoundQuery(roundId: string) {
  return useQuery({
    queryKey: roundKeys.detail(roundId),
    queryFn: ({ signal }) => getRound(roundId, signal),
    staleTime: Infinity,
  });
}

// 409 quer dizer que a rodada mudou por fora (outra aba, palpite repetido): a grade em cache está velha
export function isStaleRoundError(error: Error): boolean {
  return error instanceof ApiError && error.status === HTTP_CONFLICT;
}

export function useSubmitGuessMutation(roundId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guess: CreateGuessInput) => submitGuess(roundId, guess),
    onSuccess: ({ round }) => queryClient.setQueryData(roundKeys.detail(roundId), round),
    onError: (error) => {
      if (isStaleRoundError(error)) queryClient.invalidateQueries({ queryKey: roundKeys.detail(roundId) });
    },
  });
}
