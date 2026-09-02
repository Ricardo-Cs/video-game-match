import { useMutation, useQuery } from '@tanstack/react-query';

import { createCategories, searchGames, verifyAnswer } from '@/api/game';

export const gameKeys = {
  all: ['game'] as const,
  categories: () => [...gameKeys.all, 'categories'] as const,
  search: (search: string) => [...gameKeys.all, 'search', search] as const,
};

const MIN_SEARCH_LENGTH = 3;

/**
 * As categorias são o sorteio da rodada: refazer a chamada troca o tabuleiro
 * embaixo do jogador, então a query nunca revalida sozinha.
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: gameKeys.categories(),
    queryFn: ({ signal }) => createCategories(signal),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/**
 * A busca dispara a cada tecla e a IGDB tem rate limit de ~4 req/s, então o
 * cache por termo evita repetir chamadas enquanto o jogador corrige o texto.
 */
export function useGameSearchQuery(search: string) {
  const term = search.trim();

  return useQuery({
    queryKey: gameKeys.search(term),
    queryFn: ({ signal }) => searchGames(term, signal),
    enabled: term.length >= MIN_SEARCH_LENGTH,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVerifyAnswerMutation() {
  return useMutation({ mutationFn: verifyAnswer });
}
