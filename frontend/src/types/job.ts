/**
 * Types pour les offres d'emploi
 */

export type ContractType = "CDI" | "CDD" | "Stage" | "Freelance" | "Alternance";
export type WorkType = "Remote" | "Hybride" | "Présentiel";

export interface Job {
    id: number;
    title: string;
    description: string;
    exigences: string;
    image: string;
    company: string;
    salary: string;
    contract: ContractType;
    location: string;
    work: WorkType;
    experience: string;
    keywords: string[];
    createdAt: Date;
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
