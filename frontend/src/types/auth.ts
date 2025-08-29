/**
 * Types pour l'authentification
 */

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    role: "admin" | "recruteur" | "candidat";
    id: number;
}

export interface RegisterCandidatRequest {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    date_naissance?: string;
    poste_actuel?: string;
    entreprise_actuelle?: string;
    linkedin?: string;
}

export interface RegisterRecruteurRequest {
    email: string;
    password: string;
    nom_entreprise: string;
    siret: string;
    nom_gerant: string;
    email_professionnel: string;
    localisation: string;
    logo?: File;
    site_web?: string;
}

export interface RegisterResponse {
    token: string;
    user: User;
    message: string;
}

export interface User {
    id: number;
    email: string;
    role: "admin" | "recruteur" | "candidat";
    first_name?: string;
    last_name?: string;
    // Champs spécifiques au candidat
    date_naissance?: string;
    poste_actuel?: string;
    entreprise_actuelle?: string;
    linkedin?: string;
    // Champs spécifiques au recruteur
    nom_entreprise?: string;
    siret?: string;
    nom_gerant?: string;
    email_professionnel?: string;
    localisation?: string;
    logo?: string;
    site_web?: string;
}

// Types pour compatibilité avec le store Zustand existant
export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterCandidatData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    date_naissance: string;
    poste_actuel: string;
    entreprise_actuelle: string;
    linkedin?: string;
}

export interface RegisterEntrepriseData {
    email: string;
    password: string;
    nom_entreprise: string;
    siret: string;
    nom_gerant: string;
    email_professionnel: string;
    localisation: string;
    logo?: File;
    site_web?: string;
}

export interface AuthError {
    detail?: string;
    message?: string;
    [key: string]: string[] | string | undefined;
}
