import { GameCheckApiResponse } from "../types/types";

export const dlcsValidator = (dlcs: GameCheckApiResponse["dlcs"]): boolean =>
    (dlcs?.length ?? 0) > 0;
