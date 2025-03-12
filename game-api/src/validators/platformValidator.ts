export const platformValidator = (apiResponsePlatforms: string[] | undefined, answerPlatform: string): boolean => {
    return apiResponsePlatforms?.includes(answerPlatform) ? true : false;
};