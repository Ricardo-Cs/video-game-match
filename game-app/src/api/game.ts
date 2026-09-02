import { request } from '@/api/client';
import type {
  AnswerPayload,
  AnswerResult,
  Category,
  GameSearchResult,
} from '@/types/game';

export function createCategories(signal?: AbortSignal) {
  return request<Category[]>('/game/createCategories', { signal });
}

export function searchGames(search: string, signal?: AbortSignal) {
  return request<GameSearchResult[]>(
    `/game/search/${encodeURIComponent(search)}`,
    { signal },
  );
}

export function verifyAnswer(payload: AnswerPayload) {
  return request<AnswerResult>('/game/verifyAnswer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
