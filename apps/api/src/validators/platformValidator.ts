export const platformValidator = (apiResponsePlatforms: string[] | undefined, answerPlatform: string): boolean =>
    apiResponsePlatforms?.includes(answerPlatform) ?? false;
