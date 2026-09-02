const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * A game-api responde erro como `{ message }`, mas a rota inexistente devolve
 * uma string JSON crua — os dois formatos caem aqui.
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (typeof body === 'string') return body;
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message: unknown }).message);
    }
  } catch {
    // corpo vazio ou não-JSON: cai no texto padrão abaixo
  }

  return `Falha na requisição (HTTP ${response.status}).`;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}
