import type { GameSummary } from "../types/types";

// A IGDB devolve a miniatura sem protocolo (//images.igdb.com/.../t_thumb/...)
export const coverUrlOf = (game: GameSummary): string | null =>
    game.cover ? `https:${game.cover.url.replace("/t_thumb/", "/t_cover_big/")}` : null;
