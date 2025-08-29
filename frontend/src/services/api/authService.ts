import AxiosService from "../axiosService";
import Cookies from "js-cookie";
import type {
    LoginRequest,
    LoginResponse,
    RegisterCandidatRequest,
    RegisterRecruteurRequest,
    RegisterResponse,
    User,
    AuthError,
} from "../../types/auth";

/**
 * Service d'authentification pour l'application.
 * Gère la connexion, l'inscription et la déconnexion des utilisateurs.
 */
export class AuthService {
    private static readonly TOKEN_COOKIE_NAME = "authToken";
    private static readonly USER_ROLE_COOKIE_NAME = "userRole";
    private static readonly USER_ID_COOKIE_NAME = "userId";

    /**
     * Connecte un utilisateur avec email et mot de passe
     * @param email Email de l'utilisateur
     * @param password Mot de passe de l'utilisateur
     * @returns Promesse avec les données de connexion
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const loginData: LoginRequest = { email, password };

            const response = await AxiosService.post<LoginResponse>("/auth/login/", loginData);

            // Stocker le token et les informations utilisateur dans les cookies
            this.setAuthCookies(response.data.token, response.data.role, response.data.id);

            return response.data;
        } catch (error: any) {
            console.error(`❌ [AuthService] Erreur de connexion:`, error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * Déconnecte l'utilisateur actuel
     */
    async logout(): Promise<void> {
        try {
            await AxiosService.post("/auth/logout/");
        } catch (error) {
            // Même si la requête échoue, on supprime les cookies localement
            console.warn("Erreur lors de la déconnexion côté serveur:", error);
        } finally {
            this.clearAuthCookies();
        }
    }

    /**
     * Inscrit un nouveau candidat
     * @param candidatData Données du candidat à inscrire
     * @returns Promesse avec les données d'inscription
     */
    async registerCandidat(candidatData: RegisterCandidatRequest): Promise<RegisterResponse> {
        try {
            const response = await AxiosService.post<RegisterResponse>(
                "/auth/register/candidat/",
                candidatData,
            );

            // Stocker automatiquement le token après inscription
            this.setAuthCookies(
                response.data.token,
                response.data.user.role,
                response.data.user.id,
            );

            return response.data;
        } catch (error: any) {
            throw this.handleAuthError(error);
        }
    }

    /**
     * Inscrit un nouveau recruteur
     * @param recruteurData Données du recruteur à inscrire
     * @returns Promesse avec les données d'inscription
     */
    async registerRecruteur(recruteurData: RegisterRecruteurRequest): Promise<RegisterResponse> {
        try {
            // Créer FormData pour supporter l'upload de fichiers
            const formData = new FormData();
            
            // Ajouter tous les champs sauf le logo
            Object.keys(recruteurData).forEach(key => {
                const value = (recruteurData as any)[key];
                if (key !== 'logo' && value !== undefined && value !== '') {
                    formData.append(key, value);
                }
            });

            // Ajouter le logo s'il existe
            if (recruteurData.logo) {
                formData.append('logo', recruteurData.logo);
            }

            const response = await AxiosService.post<RegisterResponse>(
                "/auth/register/recruteur/",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Stocker automatiquement le token après inscription
            this.setAuthCookies(
                response.data.token,
                response.data.user.role,
                response.data.user.id,
            );

            return response.data;
        } catch (error: any) {
            throw this.handleAuthError(error);
        }
    }

    /**
     * Récupère les informations du profil utilisateur connecté
     * @returns Promesse avec les données utilisateur
     */
    async getMe(): Promise<User> {
        try {
            const response = await AxiosService.get<User>("/auth/me/");
            return response.data;
        } catch (error: any) {
            throw this.handleAuthError(error);
        }
    }

    /**
     * Met à jour le profil de l'utilisateur connecté
     * @param userData Données partielles à mettre à jour
     * @returns Promesse avec les données utilisateur mises à jour
     */
    async updateProfile(userData: Partial<User>): Promise<User> {
        try {
            const response = await AxiosService.patch<User>("/auth/me/", userData);
            return response.data;
        } catch (error: any) {
            throw this.handleAuthError(error);
        }
    }

    /**
     * Vérifie si l'utilisateur est connecté
     * @returns true si l'utilisateur est connecté
     */
    isAuthenticated(): boolean {
        return !!Cookies.get(AuthService.TOKEN_COOKIE_NAME);
    }

    /**
     * Récupère le token d'authentification stocké
     * @returns Le token ou null s'il n'existe pas
     */
    getToken(): string | null {
        return Cookies.get(AuthService.TOKEN_COOKIE_NAME) || null;
    }

    /**
     * Récupère le rôle de l'utilisateur connecté
     * @returns Le rôle ou null s'il n'existe pas
     */
    getUserRole(): "admin" | "recruteur" | "candidat" | null {
        const role = Cookies.get(AuthService.USER_ROLE_COOKIE_NAME);
        return role as "admin" | "recruteur" | "candidat" | null;
    }

    /**
     * Récupère l'ID de l'utilisateur connecté
     * @returns L'ID ou null s'il n'existe pas
     */
    getUserId(): number | null {
        const id = Cookies.get(AuthService.USER_ID_COOKIE_NAME);
        return id ? parseInt(id, 10) : null;
    }

    /**
     * Stocke les informations d'authentification dans les cookies
     * @param token Token d'authentification
     * @param role Rôle de l'utilisateur
     * @param id ID de l'utilisateur
     */
    private setAuthCookies(token: string, role: string, id: number): void {
        const cookieOptions = {
            expires: 7, // 7 jours
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
        };

        Cookies.set(AuthService.TOKEN_COOKIE_NAME, token, cookieOptions);
        Cookies.set(AuthService.USER_ROLE_COOKIE_NAME, role, cookieOptions);
        Cookies.set(AuthService.USER_ID_COOKIE_NAME, id.toString(), cookieOptions);
    }

    /**
     * Supprime les cookies d'authentification
     */
    private clearAuthCookies(): void {
        Cookies.remove(AuthService.TOKEN_COOKIE_NAME);
        Cookies.remove(AuthService.USER_ROLE_COOKIE_NAME);
        Cookies.remove(AuthService.USER_ID_COOKIE_NAME);
    }

    /**
     * Gère les erreurs d'authentification
     * @param error Erreur reçue
     * @returns Erreur formatée
     */
    private handleAuthError(error: any): AuthError {
        if (error.response?.data) {
            return error.response.data as AuthError;
        }

        return {
            detail: error.message || "Une erreur est survenue lors de l'authentification",
        };
    }
}

// Instance singleton du service d'authentification
const authService = new AuthService();
export default authService;
