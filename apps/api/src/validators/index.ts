import type { AnswerResult, CategoryType, Condition, VerifyAnswerData } from "@vgm/contracts";
import { AppError } from "../errors/AppError";
import { GameCheckApiResponse } from "../types/types";
import { awardValidator } from "./awardValidator";
import { companyValidator } from "./developersValidator";
import { dlcsValidator } from "./dlcsValidator";
import { gameModeValidator } from "./gameModeValidator";
import { genreValidator } from "./genreValidator";
import { platformValidator } from "./platformValidator";
import { releaseYearValidator } from "./releaseYearValidator";

type CategoryValidator = (game: GameCheckApiResponse, condition: Condition) => boolean | Promise<boolean>;

const namesOf = (items?: { name: string }[] | null) => items?.map((item) => item.name);

const yearFromEpochSeconds = (epochSeconds: number) => new Date(epochSeconds * 1000).getFullYear();

// Uma categoria nova é uma entrada aqui; o Record faz o TypeScript acusar
// qualquer tipo de CATEGORY_TYPES que ficar sem validador.
const categoryValidators: Record<CategoryType, CategoryValidator> = {
    genre: (game, { value }) => genreValidator(namesOf(game.genres), String(value)),
    platform: (game, { value }) => platformValidator(namesOf(game.platforms), String(value)),
    gameMode: (game, { value }) => gameModeValidator(namesOf(game.game_modes), String(value)),
    company: (game, { value }) =>
        companyValidator(game.involved_companies?.map(({ company }) => company.name), String(value)),
    releaseYear: (game, { operator, value }) =>
        game.first_release_date !== undefined &&
        releaseYearValidator(operator, yearFromEpochSeconds(game.first_release_date), Number(value)),
    dlcs: (game) => dlcsValidator(game.dlcs),
    award: (game, { value }) => awardValidator(game.name, String(value)),
};

// O z.enum já barra tipos desconhecidos na borda; chegar aqui sem validador é bug
// nosso e deve falhar alto, não virar "resposta incorreta"
const findValidator = (type: CategoryType): CategoryValidator => {
    if (!Object.hasOwn(categoryValidators, type)) {
        throw new AppError(`Tipo de categoria sem validador: ${type}`);
    }
    return categoryValidators[type];
};

export const checkAnswer = async (game: GameCheckApiResponse, data: VerifyAnswerData): Promise<AnswerResult> => {
    const results = await Promise.all(
        data.categories.map(({ type, condition }) => findValidator(type)(game, condition)),
    );

    const isCorrect = results.every(Boolean);

    return isCorrect
        ? { answer: true, image: game.cover?.url ?? null }
        : { answer: false, message: "Resposta incorreta!" };
};
