export const companyValidator = (apiResponseCompanies: string[] | undefined, answerCompany: string): boolean => {
    return apiResponseCompanies?.includes(answerCompany) ? true : false;
};