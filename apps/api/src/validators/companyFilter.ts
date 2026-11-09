import type { CategoryOfType } from "@vgm/contracts";

// A IGDB avalia as duas condições sobre o mesmo item de involved_companies
// (conferido: Bayonetta 2, só publicado pela Nintendo, não casa com developer = true)
export const companyFilter = ({ companyId, role }: CategoryOfType<"company">["condition"]): string =>
    `involved_companies.company = ${companyId} & involved_companies.${role} = true`;
