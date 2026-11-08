import type { CreateGuessInput } from '@vgm/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getRound, searchGames, startRound, submitGuess } from '@/api/game';

export const gameKeys = {
  all: ['game'] as const,
  search: (search: string) => [...gameKeys.all, 'search', search] as const,
};

export const roundKeys = {
  all: ['round'] as const,
  detail: (roundId: string) => [...roundKeys.all, roundId] as const,
};

const MIN_SEARCH_LENGTH = 3;

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

export function useSubmitGuessMutation(roundId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guess: CreateGuessInput) => submitGuess(roundId, guess),
    onSuccess: ({ round }) => queryClient.setQueryData(roundKeys.detail(roundId), round),
  });
}
