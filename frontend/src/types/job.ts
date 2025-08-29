/**
 * Types pour les offres d'emploi
 */

export type ContractType = "CDI" | "CDD" | "Stage" | "Freelance" | "Alternance";
export type WorkType = "Remote" | "Hybride" | "Présentiel";

export interface Job {
    id: number;
    titre: string;
    description: string;
    exigences: string;
    recruteur_nom: string;
    type_contrat: ContractType;
    salaire_min?: number;
    salaire_max?: number;
    localisation: string;
    date_creation: string; // ISO string from API
    date_expiration: string; // ISO string from API
    active: boolean;
    nombre_candidatures: number;
    // Computed fields for backwards compatibility
    title: string;
    company: string;
    salary: string;
    contract: ContractType;
    location: string;
    createdAt: Date;
    // UI fields (generated for JobCard compatibility)
    image: string;
    work: WorkType;
    experience: string;
    keywords: string[];
}

export interface JobFilters {
    search: string;
    contract: ContractType | "all";
    work: WorkType | "all";
    salaryMin: number;
    salaryMax: number;
    dateRange: "all" | "today" | "week" | "month";
}

export interface JobSearchParams {
    page: number;
    limit: number;
    filters: JobFilters;
}

export interface JobSearchResult {
    jobs: Job[];
    total: number;
    totalPages: number;
    currentPage: number;
}
