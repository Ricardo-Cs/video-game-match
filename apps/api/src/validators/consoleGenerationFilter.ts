import type { CategoryOfType } from "@vgm/contracts";

// PC e plataformas sem geração definida na IGDB não contam para nenhuma geração
export const consoleGenerationFilter = ({ generation }: CategoryOfType<"consoleGeneration">["condition"]): string =>
    `platforms.generation = ${generation}`;
