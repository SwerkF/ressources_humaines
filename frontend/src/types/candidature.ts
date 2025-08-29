/**
 * Types TypeScript pour les candidatures
 */

/**
 * Statuts possibles d'une candidature
 */
export type CandidatureStatus = 'en_attente' | 'acceptee' | 'refusee';

/**
 * Interface pour une candidature depuis l'API Django
 */
export interface Candidature {
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
    statut: CandidatureStatus;
    date_candidature: string; // ISO date string
    date_modification: string; // ISO date string
    // Champs calculés pour l'UI
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Interface pour créer une candidature
 */
export interface CreateCandidatureData {
    job: number;
    cv: File;
    lettre_motivation?: File;
    message?: string; // Message personnalisé (optionnel, pas encore dans l'API)
}

/**
 * Interface pour mettre à jour une candidature (candidat)
 */
export interface UpdateCandidatureData {
    cv?: File;
    lettre_motivation?: File;
}

/**
 * Interface pour mettre à jour le statut d'une candidature (recruteur)
 */
export interface UpdateCandidatureStatusData {
    statut: CandidatureStatus;
}

/**
 * Interface pour la réponse de création de candidature
 */
export interface CandidatureResponse {
    candidature: Candidature;
    message: string;
}

/**
 * Erreurs de validation possible lors de la création d'une candidature
 */
export interface CandidatureValidationError {
    cv?: string[];
    lettre_motivation?: string[];
    job?: string[];
    non_field_errors?: string[];
    detail?: string;
}

/**
 * Options de filtres pour les candidatures
 */
export interface CandidatureFilters {
    statut?: CandidatureStatus | 'all';
    job_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
}

/**
 * Résultat paginé de candidatures
 */
export interface CandidatureSearchResult {
    candidatures: Candidature[];
    total: number;
    totalPages: number;
    currentPage: number;
}

/**
 * Statistiques des candidatures (pour le dashboard)
 */
export interface CandidatureStats {
    total: number;
    en_attente: number;
    acceptee: number;
    refusee: number;
    this_month: number;
    last_month: number;
}

/**
 * Helper type guards
 */
export const isCandidatureStatus = (status: string): status is CandidatureStatus => {
    return ['en_attente', 'acceptee', 'refusee'].includes(status);
};

/**
 * Helper pour formater le statut en français
 */
export const getStatusLabel = (status: CandidatureStatus): string => {
    const labels: Record<CandidatureStatus, string> = {
        'en_attente': 'En attente',
        'acceptee': 'Acceptée',
        'refusee': 'Refusée',
    };
    return labels[status] || status;
};

/**
 * Helper pour obtenir la couleur du badge selon le statut
 */
export const getStatusBadgeVariant = (status: CandidatureStatus) => {
    switch (status) {
        case 'en_attente':
            return 'secondary';
        case 'acceptee':
            return 'default'; // ou 'success' si disponible
        case 'refusee':
            return 'destructive';
        default:
            return 'outline';
    }
};
