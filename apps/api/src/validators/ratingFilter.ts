import type { CategoryOfType } from "@vgm/contracts";

// Jogo sem nota na IGDB não tem total_rating e nunca casa, nem com "abaixo de"
export const ratingFilter = ({ operator, value }: CategoryOfType<"rating">["condition"]): string =>
    `total_rating ${operator} ${value}`;
