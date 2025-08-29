import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "@/services/api/authService";
import type { User, LoginData, RegisterCandidatData, RegisterEntrepriseData } from "@/types/auth";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    registerCandidat: (data: RegisterCandidatData) => Promise<void>;
    registerEntreprise: (data: RegisterEntrepriseData) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    setUser: (user: User) => void;
    initAuth: () => Promise<void>;
}

/**
 * Store Zustand pour gérer l'état d'authentification de l'utilisateur
 * Persiste les données dans localStorage pour maintenir la session
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            /**
             * Connexion de l'utilisateur
             * @param data - Données de connexion (email et mot de passe)
             */
            login: async (data: LoginData) => {
                set({ isLoading: true });
                try {
                    await authService.login(data.email, data.password);

                    // Récupérer les données complètes du profil
                    const userData = await authService.getMe();

                    set({
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            /**
             * Déconnexion de l'utilisateur
             */
            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                } catch (error) {
                    // Même en cas d'erreur, on déconnecte localement
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            /**
             * Inscription d'un nouveau candidat
             * @param data - Données d'inscription du candidat
             */
            registerCandidat: async (data: RegisterCandidatData) => {
                set({ isLoading: true });
                try {
                    const registerResponse = await authService.registerCandidat(data);

                    set({
                        user: registerResponse.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            /**
             * Inscription d'une nouvelle entreprise
             * @param data - Données d'inscription de l'entreprise
             */
            registerEntreprise: async (data: RegisterEntrepriseData) => {
                set({ isLoading: true });
                try {
                    const registerResponse = await authService.registerRecruteur(data);

                    set({
                        user: registerResponse.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            /**
             * Met à jour le profil de l'utilisateur connecté
             * @param data - Données partielles à mettre à jour
             */
            updateProfile: async (data: Partial<User>) => {
                set({ isLoading: true });
                try {
                    const updatedUser = await authService.updateProfile(data);

                    set({
                        user: updatedUser,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            /**
             * Définir l'utilisateur manuellement
             * @param user - Objet utilisateur
             */
            setUser: (user: User) => {
                set({
                    user,
                    isAuthenticated: true,
                });
            },

            /**
             * Initialise l'authentification au démarrage de l'application
             */
            initAuth: async () => {
                set({ isLoading: true });
                try {
                    if (authService.isAuthenticated()) {
                        const userData = await authService.getMe();

                        set({
                            user: userData,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        set({ isLoading: false });
                    }
                } catch (error) {
                    // En cas d'erreur, nettoyer l'état
                    await get().logout();
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
