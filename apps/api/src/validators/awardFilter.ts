import type { CategoryOfType } from "@vgm/contracts";
import { AppError } from "../errors/AppError";

export type AwardWinnerIds = ReadonlyMap<string, readonly number[]>;

// version_parent aceita as edições do vencedor (Deluxe, GOTY Edition...), que são outros ids na IGDB
export const awardFilter = (
    { award }: CategoryOfType<"award">["condition"],
    awardWinnerIds: AwardWinnerIds,
): string => {
    const winnerIds = awardWinnerIds.get(award);

    if (!winnerIds?.length) {
        throw new AppError(`Prêmio sem vencedores cadastrados: ${award}`);
    }

    const ids = winnerIds.join(",");
    return `(id = (${ids}) | version_parent = (${ids}))`;
};
