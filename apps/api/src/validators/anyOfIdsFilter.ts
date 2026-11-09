// Em campos de lista da IGDB, `= (a, b)` casa jogos que têm qualquer um dos ids
export const anyOfIdsFilter = (field: string, ids: readonly number[]): string => `${field} = (${ids.join(",")})`;
