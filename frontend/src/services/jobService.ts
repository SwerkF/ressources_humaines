import type { Job, JobFilters, JobSearchParams, JobSearchResult } from "@/types/job";
import AxiosService from "./axiosService";

// Interface pour les données brutes de l'API Django
interface ApiJob {
    id: number;
    titre: string;
    description: string;
    exigences: string;
    recruteur_nom: string;
    recruteur_logo?: string | null;
    type_contrat: string;
    salaire_min?: number;
    salaire_max?: number;
    localisation: string;
    date_creation: string;
    date_expiration: string;
    active: boolean;
    nombre_candidatures: number;
}

// Interface pour la réponse paginée de Django REST Framework
interface DRFPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/**
 * Service pour gérer les offres d'emploi
 */
export class JobService {
    /**
     * Transforme les données de l'API Django vers le format attendu par l'UI
     */
    private transformJob(apiJob: ApiJob): Job {
        const createdAt = new Date(apiJob.date_creation);
        const salaryString = this.formatSalary(apiJob.salaire_min, apiJob.salaire_max);

        return {
            // Champs de l'API Django
            id: apiJob.id,
            titre: apiJob.titre,
            description: apiJob.description,
            exigences: apiJob.exigences,
            recruteur_nom: apiJob.recruteur_nom,
            type_contrat: apiJob.type_contrat as any,
            salaire_min: apiJob.salaire_min,
            salaire_max: apiJob.salaire_max,
            localisation: apiJob.localisation,
            date_creation: apiJob.date_creation,
            date_expiration: apiJob.date_expiration,
            active: apiJob.active,
            nombre_candidatures: apiJob.nombre_candidatures,
            
            // Champs pour la compatibilité backwards
            title: apiJob.titre,
            company: apiJob.recruteur_nom,
            salary: salaryString,
            contract: apiJob.type_contrat as any,
            location: apiJob.localisation,
            createdAt,
            
            // UI fields générés pour JobCard
            image: this.getCompanyLogo(apiJob.recruteur_logo, apiJob.recruteur_nom),
            work: this.inferWorkType(apiJob.description),
            experience: this.inferExperience(apiJob.exigences),
            keywords: this.extractKeywords(apiJob.titre, apiJob.description, apiJob.exigences),
        };
    }

    /**
     * Récupère le logo de l'entreprise (réel ou généré)
     */
    private getCompanyLogo(recruteurLogo: string | null | undefined, companyName: string): string {
        // Utiliser le vrai logo s'il existe
        if (recruteurLogo) {
            // Si c'est déjà une URL complète, l'utiliser directement
            if (recruteurLogo.startsWith('http')) {
                return recruteurLogo;
            }
            
            // Construire l'URL complète avec la base Django
            const baseUrl = 'http://localhost:8000'; // Same as axiosService
            
            // Si c'est un chemin qui commence par "/media/", l'utiliser tel quel
            if (recruteurLogo.startsWith('/media/')) {
                return `${baseUrl}${recruteurLogo}`;
            }
            
            // Si c'est juste le nom du fichier (ex: "media/recruteurs/logos/logo.png")
            if (recruteurLogo.includes('media/')) {
                return `${baseUrl}/${recruteurLogo}`;
            }
            
            // Pour autres cas, ajouter le préfixe media
            return `${baseUrl}/media/${recruteurLogo}`;
        }
        
        // Fallback: générer un avatar par défaut
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=128&background=random`;
    }

    /**
     * Génère une URL de logo d'entreprise par défaut (pour compatibilité)
     */
    private generateCompanyLogo(companyName: string): string {
        return this.getCompanyLogo(null, companyName);
    }

    /**
     * Infère le type de travail depuis la description
     */
    private inferWorkType(description: string): "Remote" | "Hybride" | "Présentiel" {
        const text = description.toLowerCase();
        if (text.includes('remote') || text.includes('télétravail') || text.includes('distance')) {
            return "Remote";
        }
        if (text.includes('hybride') || text.includes('flex')) {
            return "Hybride";
        }
        return "Présentiel"; // Par défaut
    }

    /**
     * Infère le niveau d'expérience requis
     */
    private inferExperience(exigences: string): string {
        const text = exigences.toLowerCase();
        if (text.includes('junior') || text.includes('débutant') || text.includes('0-2')) {
            return "Junior (0-2 ans)";
        }
        if (text.includes('senior') || text.includes('expert') || text.includes('5+') || text.includes('senior')) {
            return "Senior (5+ ans)";
        }
        if (text.includes('3') || text.includes('4')) {
            return "Intermédiaire (3-5 ans)";
        }
        return "Expérience variable"; // Par défaut
    }

    /**
     * Extrait des mots-clés depuis le titre, description et exigences
     */
    private extractKeywords(titre: string, description: string, exigences: string): string[] {
        const text = `${titre} ${description} ${exigences}`.toLowerCase();
        
        // Liste de technologies/compétences communes
        const techKeywords = [
            'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java', 'php',
            'nodejs', 'express', 'django', 'laravel', 'sql', 'mysql', 'postgresql', 'mongodb',
            'aws', 'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'figma',
            'photoshop', 'illustrator', 'ux', 'ui', 'design', 'agile', 'scrum', 'devops'
        ];
        
        const foundKeywords = techKeywords.filter(keyword => 
            text.includes(keyword)
        );
        
        // Ajouter le type de contrat comme keyword
        const contractTypes = ['cdi', 'cdd', 'stage', 'freelance', 'alternance'];
        const contractKeyword = contractTypes.find(type => text.includes(type));
        if (contractKeyword) {
            foundKeywords.push(contractKeyword.toUpperCase());
        }
        
        // Limiter à 5 mots-clés maximum
        return foundKeywords.slice(0, 5);
    }

    /**
     * Formate le salaire pour l'affichage
     */
    private formatSalary(min?: number, max?: number): string {
        if (!min && !max) return "Non spécifié";
        if (min && max && min !== max) return `${min}€ - ${max}€`;
        if (min) return `À partir de ${min}€`;
        if (max) return `Jusqu'à ${max}€`;
        return "Non spécifié";
    }

    /**
     * Recherche et filtre les offres d'emploi via l'API Django
     * @param params - Paramètres de recherche et filtres
     * @returns Résultat paginé des offres d'emploi
     */
    async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
        try {
            // Construire les paramètres de requête
            const queryParams = new URLSearchParams();
            
            // Pagination - Django REST Framework utilise 'page' et 'page_size' par défaut
            queryParams.append('page', params.page.toString());
            if (params.limit !== 20) { // 20 est la taille par défaut dans settings.py
                queryParams.append('page_size', params.limit.toString());
            }
            
            // Filtres - Note: Ces filtres dépendent de la configuration Django
            if (params.filters.search) {
                queryParams.append('search', params.filters.search);
            }
            if (params.filters.contract !== 'all') {
                queryParams.append('type_contrat', params.filters.contract);
            }
            // Note: Les filtres de salaire nécessitent django-filter ou une implémentation custom
            if (params.filters.salaryMin > 0) {
                queryParams.append('salaire_min__gte', params.filters.salaryMin.toString());
            }
            if (params.filters.salaryMax < 100000) {
                queryParams.append('salaire_max__lte', params.filters.salaryMax.toString());
            }
            // Note: Le filtre de date nécessite une implémentation custom
            if (params.filters.dateRange !== 'all') {
                queryParams.append('date_range', params.filters.dateRange);
            }
            
            // Utiliser l'endpoint publique qui ne nécessite pas d'authentification
            const response = await AxiosService.get<ApiJob[] | DRFPaginatedResponse<ApiJob>>(
                `/jobs/publiques/?${queryParams.toString()}`
            );

            // L'endpoint publiques retourne soit un array direct, soit une réponse paginée
            let jobs: ApiJob[];
            let total: number;
            
            if (Array.isArray(response.data)) {
                // Réponse directe en array (fallback pour compatibilité)
                console.warn('API retourne un array simple, pagination côté client utilisée');
                const allJobs = response.data;
                total = allJobs.length;
                
                // Pagination manuelle côté client
                const startIndex = (params.page - 1) * params.limit;
                const endIndex = startIndex + params.limit;
                jobs = allJobs.slice(startIndex, endIndex);
            } else {
                // Réponse paginée DRF (cas optimal)
                jobs = response.data.results;
                total = response.data.count;
            }

            const transformedJobs = jobs.map(job => this.transformJob(job));
            const totalPages = Math.ceil(total / params.limit);

            return {
                jobs: transformedJobs,
                total,
                totalPages,
                currentPage: params.page,
            };
        } catch (error) {
            console.error('Erreur lors de la recherche des offres:', error);
            // Fallback en cas d'erreur
            return {
                jobs: [],
                total: 0,
                totalPages: 0,
                currentPage: 1,
            };
        }
    }

    /**
     * Récupère une offre d'emploi par son ID via l'API Django
     * @param id - ID de l'offre
     * @returns Offre d'emploi ou null si non trouvée
     */
    async getJobById(id: number): Promise<Job | null> {
        try {
            const response = await AxiosService.get<ApiJob>(`/jobs/${id}/`);
            return this.transformJob(response.data);
        } catch (error) {
            console.error(`Erreur lors de la récupération du job ${id}:`, error);
            return null;
        }
    }
}

// Instance singleton du service
export const jobService = new JobService();
