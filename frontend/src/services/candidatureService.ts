import AxiosService from "./axiosService";

/**
 * Interface pour une candidature depuis l'API Django
 */
export interface CandidatureAPI {
    id: number;
    candidat: number;
    candidat_nom: string;
    candidat_prenom: string;
    candidat_email: string;
    job: number;
    job_titre: string;
    entreprise: string;
    cv: string;
    lettre_motivation?: string | null;
    statut: 'en_attente' | 'acceptee' | 'refusee';
    date_candidature: string;
    date_modification: string;
}

/**
 * Interface pour créer une candidature
 */
export interface CreateCandidatureData {
    job: number;
    cv: File;
    lettre_motivation?: File;
}

/**
 * Interface pour la réponse de candidature
 */
export interface CandidatureResponse {
    candidature: CandidatureAPI;
    message: string;
}

/**
 * Service pour gérer les candidatures
 */
class CandidatureService {
    /**
     * Crée une nouvelle candidature
     */
    async createCandidature(data: CreateCandidatureData): Promise<CandidatureResponse> {
        try {
            // Créer FormData pour l'upload de fichiers
            const formData = new FormData();
            formData.append('job', data.job.toString());
            formData.append('cv', data.cv);
            
            if (data.lettre_motivation) {
                formData.append('lettre_motivation', data.lettre_motivation);
            }

            const response = await AxiosService.post<CandidatureAPI>('/candidatures/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                candidature: response.data,
                message: 'Candidature envoyée avec succès'
            };
        } catch (error: any) {
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                
                // Gestion des erreurs spécifiques
                if (errorData.detail?.includes('déjà postulé')) {
                    throw new Error('Vous avez déjà postulé pour cette offre');
                }
                
                if (errorData.non_field_errors) {
                    throw new Error(errorData.non_field_errors[0] || 'Erreur de validation');
                }
                
                // Erreurs sur les champs
                const fieldErrors = [];
                if (errorData.cv) fieldErrors.push(`CV: ${errorData.cv[0]}`);
                if (errorData.lettre_motivation) fieldErrors.push(`Lettre: ${errorData.lettre_motivation[0]}`);
                if (errorData.job) fieldErrors.push(`Offre: ${errorData.job[0]}`);
                
                if (fieldErrors.length > 0) {
                    throw new Error(fieldErrors.join(', '));
                }
            }
            
            throw new Error(error.response?.data?.detail || 'Erreur lors de l\'envoi de la candidature');
        }
    }

    /**
     * Récupère les candidatures du candidat connecté
     */
    async getMyCandidatures(): Promise<CandidatureAPI[]> {
        try {
            const response = await AxiosService.get<CandidatureAPI[]>('/candidatures/my_candidatures/');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des candidatures');
        }
    }

    /**
     * Vérifie si l'utilisateur a déjà postulé pour une offre
     */
    async hasAppliedToJob(jobId: number): Promise<boolean> {
        try {
            const candidatures = await this.getMyCandidatures();
            return candidatures.some(candidature => candidature.job === jobId);
        } catch (error) {
            console.error('Erreur lors de la vérification de candidature:', error);
            return false;
        }
    }

    /**
     * Récupère une candidature spécifique
     */
    async getCandidature(id: number): Promise<CandidatureAPI> {
        try {
            const response = await AxiosService.get<CandidatureAPI>(`/candidatures/${id}/`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération de la candidature');
        }
    }

    /**
     * Met à jour une candidature (pour les candidats - CV et lettre seulement)
     */
    async updateCandidature(id: number, data: Partial<CreateCandidatureData>): Promise<CandidatureAPI> {
        try {
            const formData = new FormData();
            
            if (data.cv) {
                formData.append('cv', data.cv);
            }
            
            if (data.lettre_motivation) {
                formData.append('lettre_motivation', data.lettre_motivation);
            }

            const response = await AxiosService.patch<CandidatureAPI>(`/candidatures/${id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour de la candidature');
        }
    }

    /**
     * Met à jour le statut d'une candidature (recruteurs seulement)
     */
    async updateCandidatureStatus(
        id: number, 
        statut: 'en_attente' | 'acceptee' | 'refusee',
        message?: string
    ): Promise<CandidatureAPI> {
        try {
            const response = await AxiosService.patch<CandidatureAPI>(`/candidatures/${id}/`, {
                statut,
                ...(message && { message_recruteur: message })
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour du statut de la candidature');
        }
    }

    /**
     * Supprime une candidature
     */
    async deleteCandidature(id: number): Promise<void> {
        try {
            await AxiosService.delete(`/candidatures/${id}/`);
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression de la candidature');
        }
    }

    /**
     * Valide un fichier CV ou lettre de motivation
     */
    validateFile(file: File, type: 'cv' | 'lettre'): string | null {
        // Taille maximale: 5MB
        const maxSize = 5 * 1024 * 1024;
        
        if (file.size > maxSize) {
            return `Le fichier ${type} ne doit pas dépasser 5MB`;
        }
        
        // Types de fichiers acceptés
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return `Le fichier ${type} doit être un PDF`;
        }
        
        return null;
    }
}

// Instance exportée
export const candidatureService = new CandidatureService();
export default candidatureService;
