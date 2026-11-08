import type {
  CreateGuessInput,
  GameSearchResult,
  GuessResult,
  RoundView,
} from '@vgm/contracts';

import { request } from '@/api/client';

export function searchGames(search: string, signal?: AbortSignal) {
  return request<GameSearchResult[]>(
    `/game/search/${encodeURIComponent(search)}`,
    { signal },
  );
}

export function startRound() {
  return request<RoundView>('/rounds', { method: 'POST' });
}

export function getRound(roundId: string, signal?: AbortSignal) {
  return request<RoundView>(`/rounds/${roundId}`, { signal });
}

export function submitGuess(roundId: string, guess: CreateGuessInput) {
  return request<GuessResult>(`/rounds/${roundId}/guesses`, {
    method: 'POST',
    body: JSON.stringify(guess),
  });
}
