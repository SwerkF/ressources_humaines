/**
 * Types pour la gestion des offres d'emploi côté entreprise
 */

import type { Job } from "./job";
import type { JobApplication } from "./application";

export interface CompanyJob extends Job {
    isActive: boolean;
    applicationsCount: number;
    viewsCount: number;
    applications?: JobApplication[];
}

export interface CompanyDashboardStats {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalViews: number;
}

export interface JobCreationData {
    title: string;
    description: string;
    exigences: string;
    salary: string;
    contract: "CDI" | "CDD" | "Stage" | "Freelance" | "Alternance";
    location: string;
    work: "Remote" | "Hybride" | "Présentiel";
    experience: string;
    keywords: string[];
}
