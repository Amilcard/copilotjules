export interface FinancialAid {
  id: string;
  title: string;
  description: string;
  eligibility_summary: string;
  more_info_link?: string;
  icon?: string; // Placeholder for icon, e.g., emoji or class name
}

export const financialAidsData: FinancialAid[] = [
  {
    id: 'pass-sport',
    title: "Pass'Sport",
    description: "Une allocation de rentrée sportive de 50 euros par enfant/jeune adulte pour financer tout ou partie de son inscription dans une structure sportive éligible.",
    eligibility_summary: "Pour les jeunes de 6 à 18 ans bénéficiaires de l'allocation de rentrée scolaire (ARS), ou de l'allocation d'éducation de l'enfant handicapé (AEEH). Également pour les étudiants boursiers jusqu'à 28 ans.",
    more_info_link: "https://www.pass.sports.gouv.fr/",
    icon: "⚽", // Example emoji
  },
  {
    id: 'pass-culture',
    title: "Pass'Culture",
    description: "Un dispositif favorisant l'accès à la culture pour les jeunes de 15 à 18 ans, avec un crédit à utiliser pour des activités culturelles, des biens culturels ou des services numériques.",
    eligibility_summary: "Pour les jeunes résidant en France métropolitaine ou d'outre-mer, âgés de 15, 16, 17 ou 18 ans. Le montant varie selon l'âge.",
    more_info_link: "https://pass.culture.fr/",
    icon: "🎭", // Example emoji
  },
  {
    id: 'aides-caf-regionales',
    title: "Aides CAF Régionales (Exemple)",
    description: "De nombreuses Caisses d'Allocations Familiales (CAF) proposent des aides locales pour les loisirs, les vacances ou les activités des enfants (ex: 'Tickets Loisirs', 'Passeports Loisirs Jeunes').",
    eligibility_summary: "Varie selon la CAF départementale et le quotient familial. Se renseigner directement auprès de sa CAF.",
    more_info_link: undefined, // User would need to check their local CAF
    icon: "🏢", // Example emoji
  },
  {
    id: 'bourses-scolaires-locales',
    title: "Bourses Scolaires et Aides Locales (Exemple)",
    description: "Certaines mairies, départements ou régions offrent des bourses ou des aides spécifiques pour les activités périscolaires, la cantine, ou des fournitures, souvent basées sur les revenus.",
    eligibility_summary: "Conditions spécifiques à chaque collectivité locale. Consulter le site de sa mairie ou de son conseil départemental/régional.",
    more_info_link: undefined,
    icon: "🎓", // Example emoji
  },
];
