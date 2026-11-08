import type { GameSearchResult } from "@vgm/contracts";
import { searchGames } from "../integrations/igdb";

export const gameSearchService = async (search: string): Promise<GameSearchResult[]> => {
    const games = await searchGames(search);

    return games.map((game) => ({
        id: game.id,
        name: game.name,
        release_year: game.first_release_date
            ? new Date(game.first_release_date * 1000).getFullYear()
            : undefined,
    }));
};
