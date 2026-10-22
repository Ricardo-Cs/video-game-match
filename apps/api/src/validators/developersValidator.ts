export const companyValidator = (apiResponseCompanies: string[] | undefined, answerCompany: string): boolean =>
    apiResponseCompanies?.includes(answerCompany) ?? false;
