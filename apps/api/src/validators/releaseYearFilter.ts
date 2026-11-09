import type { CategoryOfType, ComparisonOperator } from "@vgm/contracts";

const startOfYearInEpochSeconds = (year: number): number => Date.UTC(year, 0, 1) / 1000;

// first_release_date é um instante; "ano < 2000" vira "antes de 1º/jan/2000 (UTC)"
const yearBoundaries: Record<ComparisonOperator, (year: number) => string> = {
    "<": (year) => `< ${startOfYearInEpochSeconds(year)}`,
    "<=": (year) => `< ${startOfYearInEpochSeconds(year + 1)}`,
    ">": (year) => `>= ${startOfYearInEpochSeconds(year + 1)}`,
    ">=": (year) => `>= ${startOfYearInEpochSeconds(year)}`,
};

export const releaseYearFilter = ({ operator, value }: CategoryOfType<"releaseYear">["condition"]): string =>
    `first_release_date ${yearBoundaries[operator](value)}`;
