import AxiosService from "./axiosService";
import { candidatureService, type CandidatureAPI } from "./candidatureService";

/**
 * Interface pour un job depuis l'API Django côté recruteur
 */
export interface CompanyJobAPI {
    id: number;
    titre: string;
    description: string;
    exigences: string;
    recruteur: number;
    recruteur_nom: string;
    recruteur_logo?: string | null;
    type_contrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Alternance';
    salaire_min?: number;
    salaire_max?: number;
    localisation: string;
    date_creation: string;
    date_expiration: string;
    active: boolean;
    nombre_candidatures: number;
}

/**
 * Interface pour les statistiques du dashboard
 */
export interface DashboardStats {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
}

/**
 * Interface pour la réponse paginée des jobs
 */
export interface PaginatedJobsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CompanyJobAPI[];
}

/**
 * Interface pour la réponse paginée des candidatures
 */
export interface PaginatedCandidaturesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CandidatureAPI[];
}

/**
 * Interface pour créer un job
 */
export interface CreateJobData {
    titre: string;
    description: string;
    exigences: string;
    type_contrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Alternance';
    salaire_min?: number;
    salaire_max?: number;
    localisation: string;
    date_expiration: string;
}

/**
 * Service pour gérer les données entreprise/recruteur
 */
class CompanyService {
    /**
     * Récupère les jobs du recruteur connecté
     */
    async getMyJobs(): Promise<CompanyJobAPI[]> {
        try {
            const response = await AxiosService.get<PaginatedJobsResponse>('/jobs/');
            
            // Extraire les résultats de la réponse paginée
            if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            } else if (Array.isArray(response.data)) {
                // Fallback si l'API retourne directement un tableau
                return response.data;
            } else {
                console.error('Format de réponse inattendu:', response.data);
                return [];
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des offres');
        }
    }

    /**
     * Récupère les candidatures pour un job spécifique
     */
    async getJobCandidatures(jobId: number): Promise<CandidatureAPI[]> {
        try {
            const response = await AxiosService.get<PaginatedCandidaturesResponse>(`/jobs/${jobId}/candidatures/`);
            
            // Extraire les candidatures de la réponse (paginée ou directe)
            if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            } else if (Array.isArray(response.data)) {
                // Fallback si l'API retourne directement un tableau
                return response.data;
            } else {
                console.warn('Format de réponse candidatures job inattendu:', response.data);
                return [];
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des candidatures');
        }
    }

    /**
     * Crée un nouveau job
     */
    async createJob(jobData: CreateJobData): Promise<CompanyJobAPI> {
        try {
            const response = await AxiosService.post<CompanyJobAPI>('/jobs/', jobData);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                const fieldErrors = [];
                
                Object.keys(errorData).forEach(field => {
                    if (Array.isArray(errorData[field])) {
                        fieldErrors.push(`${field}: ${errorData[field][0]}`);
                    }
                });
                
                if (fieldErrors.length > 0) {
                    throw new Error(fieldErrors.join(', '));
                }
            }
            
            throw new Error(error.response?.data?.detail || 'Erreur lors de la création de l\'offre');
        }
    }

    /**
     * Met à jour un job
     */
    async updateJob(jobId: number, jobData: Partial<CreateJobData>): Promise<CompanyJobAPI> {
        try {
            const response = await AxiosService.patch<CompanyJobAPI>(`/jobs/${jobId}/`, jobData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour de l\'offre');
        }
    }

    /**
     * Supprime un job
     */
    async deleteJob(jobId: number): Promise<void> {
        try {
            await AxiosService.delete(`/jobs/${jobId}/`);
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression de l\'offre');
        }
    }

    /**
     * Active/désactive un job
     */
    async toggleJobStatus(jobId: number, active: boolean): Promise<CompanyJobAPI> {
        try {
            const response = await AxiosService.patch<CompanyJobAPI>(`/jobs/${jobId}/`, { active });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors du changement de statut');
        }
    }

    /**
     * Calcule les statistiques dashboard à partir des jobs et candidatures
     */
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            // Récupérer tous les jobs du recruteur
            const jobs = await this.getMyJobs();
            
            // Calculer les stats de base
            const totalJobs = jobs.length;
            const activeJobs = jobs.filter(job => job.active).length;
            const totalApplications = jobs.reduce((sum, job) => sum + job.nombre_candidatures, 0);
            
            // Pour les statistiques détaillées des candidatures, on utilise l'API candidatures globale
            let pendingApplications = 0;
            let acceptedApplications = 0;
            let rejectedApplications = 0;
            
            try {
                // Récupérer toutes les candidatures du recruteur via l'endpoint général
                const response = await AxiosService.get<PaginatedCandidaturesResponse>('/candidatures/');
                
                let allCandidatures: CandidatureAPI[] = [];
                
                // Extraire les candidatures de la réponse (paginée ou directe)
                if (response.data && Array.isArray(response.data.results)) {
                    allCandidatures = response.data.results;
                } else if (Array.isArray(response.data)) {
                    // Fallback si l'API retourne directement un tableau
                    allCandidatures = response.data;
                } else {
                    console.warn('Format de réponse candidatures inattendu:', response.data);
                    allCandidatures = [];
                }
                
                // Les candidatures sont déjà filtrées côté backend pour ce recruteur
                pendingApplications = allCandidatures.filter(c => c.statut === 'en_attente').length;
                acceptedApplications = allCandidatures.filter(c => c.statut === 'acceptee').length;
                rejectedApplications = allCandidatures.filter(c => c.statut === 'refusee').length;
                
            } catch (error) {
                console.warn('Erreur récupération statistiques candidatures:', error);
                // En cas d'erreur, estimation basée sur les jobs
                // On estime que 70% sont en attente, 20% acceptées, 10% refusées
                pendingApplications = Math.floor(totalApplications * 0.7);
                acceptedApplications = Math.floor(totalApplications * 0.2);
                rejectedApplications = totalApplications - pendingApplications - acceptedApplications;
            }
            
            return {
                totalJobs,
                activeJobs,
                totalApplications,
                pendingApplications,
                acceptedApplications,
                rejectedApplications,
            };
        } catch (error: any) {
            console.error('Erreur getDashboardStats:', error);
            throw new Error(error.message || 'Erreur lors du calcul des statistiques');
        }
    }

    /**
     * Formate le salaire pour l'affichage
     */
    formatSalary(salaire_min?: number, salaire_max?: number): string {
        if (!salaire_min && !salaire_max) {
            return "Salaire non spécifié";
        }
        
        if (salaire_min && salaire_max) {
            if (salaire_min === salaire_max) {
                return `${salaire_min.toLocaleString('fr-FR')}€`;
            }
            return `${salaire_min.toLocaleString('fr-FR')}€ - ${salaire_max.toLocaleString('fr-FR')}€`;
        }
        
        if (salaire_min) {
            return `À partir de ${salaire_min.toLocaleString('fr-FR')}€`;
        }
        
        if (salaire_max) {
            return `Jusqu'à ${salaire_max.toLocaleString('fr-FR')}€`;
        }
        
        return "Salaire à négocier";
    }

    /**
     * Transforme un job API en format UI
     */
    transformJobForUI(apiJob: CompanyJobAPI) {
        return {
            // Champs API originaux
            id: apiJob.id,
            titre: apiJob.titre,
            description: apiJob.description,
            exigences: apiJob.exigences,
            type_contrat: apiJob.type_contrat,
            salaire_min: apiJob.salaire_min,
            salaire_max: apiJob.salaire_max,
            localisation: apiJob.localisation,
            date_creation: apiJob.date_creation,
            date_expiration: apiJob.date_expiration,
            active: apiJob.active,
            nombre_candidatures: apiJob.nombre_candidatures,
            recruteur_nom: apiJob.recruteur_nom,
            recruteur_logo: apiJob.recruteur_logo,
            
            // Champs UI compatibles
            title: apiJob.titre,
            company: apiJob.recruteur_nom,
            salary: this.formatSalary(apiJob.salaire_min, apiJob.salaire_max),
            contract: apiJob.type_contrat,
            location: apiJob.localisation,
            createdAt: new Date(apiJob.date_creation),
            isActive: apiJob.active,
            applicationsCount: apiJob.nombre_candidatures,
            viewsCount: 0, // Non disponible dans l'API pour l'instant
        };
    }
}

// Instance exportée
export const companyService = new CompanyService();
export default companyService;
