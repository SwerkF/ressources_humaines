/**
 * Types pour l'administration et les statistiques
 */

export interface AdminStats {
    totalUsers: number;
    totalCandidats: number;
    totalEntreprises: number;
    totalJobs: number;
    totalApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    pendingApplications: number;
    activeJobs: number;
    inactiveJobs: number;
    totalViews: number;
}

export interface UserGrowthData {
    month: string;
    candidats: number;
    entreprises: number;
    total: number;
}

export interface ApplicationStatusData {
    name: string;
    value: number;
    color: string;
}

export interface JobsByContractData {
    contract: string;
    count: number;
    percentage: number;
}

export interface MonthlyActivityData {
    month: string;
    applications: number;
    jobsCreated: number;
    newUsers: number;
}

export interface TopCompaniesData {
    company: string;
    jobsCount: number;
    applicationsReceived: number;
    averageViews: number;
}

export interface AdminDashboardData {
    stats: AdminStats;
    userGrowth: UserGrowthData[];
    applicationStatus: ApplicationStatusData[];
    jobsByContract: JobsByContractData[];
    monthlyActivity: MonthlyActivityData[];
    topCompanies: TopCompaniesData[];
}

export type AdminRole = "super_admin" | "admin" | "moderator";

export interface AdminUser {
    id: string;
    email: string;
    role: AdminRole;
    permissions: string[];
    lastLogin: Date;
    createdAt: Date;
}
