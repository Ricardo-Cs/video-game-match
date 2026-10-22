export const gameModeValidator = (apiResponseGameModes: string[] | undefined, answerGameMode: string): boolean =>
    apiResponseGameModes?.includes(answerGameMode) ?? false;
