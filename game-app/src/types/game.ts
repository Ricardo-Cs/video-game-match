/**
 * Espelha os tipos de resposta da game-api (`src/types/types.ts`).
 * Enquanto não existe um pacote `shared` no monorepo, a duplicação é consciente.
 */

export interface Condition {
  field: string;
  operator: string;
  value: string | number;
}

export interface Category {
  name: string;
  type: string;
  condition: Condition;
}

export interface GameSearchResult {
  id: number;
  name: string;
  release_year?: number;
}

export interface AnswerPayload {
  id: number | string;
  categories: Category[];
}

export interface AnswerResult {
  answer: boolean;
  image?: string | null;
  message?: string;
}
