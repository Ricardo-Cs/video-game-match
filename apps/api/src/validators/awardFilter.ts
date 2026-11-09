import type { CategoryOfType } from "@vgm/contracts";
import { AppError } from "../errors/AppError";

export type AwardWinnerIds = ReadonlyMap<string, readonly number[]>;

export const hasAwardWinners = (award: string, awardWinnerIds: AwardWinnerIds): boolean =>
    (awardWinnerIds.get(award)?.length ?? 0) > 0;

// version_parent aceita as edições do vencedor (Deluxe, GOTY Edition...), que são outros ids na IGDB
export const awardFilter = (
    { award }: CategoryOfType<"award">["condition"],
    awardWinnerIds: AwardWinnerIds,
): string => {
    if (!hasAwardWinners(award, awardWinnerIds)) {
        throw new AppError(`Prêmio sem vencedores cadastrados: ${award}`);
    }

    const ids = awardWinnerIds.get(award)!.join(",");
    return `(id = (${ids}) | version_parent = (${ids}))`;
};
