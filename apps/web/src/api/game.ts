import type {
  AnswerResult,
  Category,
  GameSearchResult,
  VerifyAnswerInput,
} from '@vgm/contracts';

import { request } from '@/api/client';

export function createCategories(signal?: AbortSignal) {
  return request<Category[]>('/game/createCategories', { signal });
}

export function searchGames(search: string, signal?: AbortSignal) {
  return request<GameSearchResult[]>(
    `/game/search/${encodeURIComponent(search)}`,
    { signal },
  );
}

export function verifyAnswer(payload: VerifyAnswerInput) {
  return request<AnswerResult>('/game/verifyAnswer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
