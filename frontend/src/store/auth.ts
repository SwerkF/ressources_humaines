import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginData, RegisterCandidatData, RegisterEntrepriseData } from "@/types/auth";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    logout: () => void;
    registerCandidat: (data: RegisterCandidatData) => Promise<void>;
    registerEntreprise: (data: RegisterEntrepriseData) => Promise<void>;
    setUser: (user: User) => void;
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
                    // Simulation d'un appel API
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // Pour la démo, on crée un utilisateur fictif
                    const user: User = {
                        id: "1",
                        userType: "candidat",
                        prenom: "John",
                        nom: "Doe",
                        email: data.email,
                        dateNaissance: "1990-01-01",
                        posteActuel: "Développeur",
                        entrepriseActuelle: "TechCorp",
                        createdAt: new Date(),
                    };

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw new Error("Échec de la connexion");
                }
            },

            /**
             * Déconnexion de l'utilisateur
             */
            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            /**
             * Inscription d'un nouveau candidat
             * @param data - Données d'inscription du candidat
             */
            registerCandidat: async (data: RegisterCandidatData) => {
                set({ isLoading: true });
                try {
                    // Simulation d'un appel API
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    const user: User = {
                        id: Date.now().toString(),
                        userType: "candidat",
                        prenom: data.prenom,
                        nom: data.nom,
                        email: data.email,
                        dateNaissance: data.dateNaissance,
                        posteActuel: data.posteActuel,
                        entrepriseActuelle: data.entrepriseActuelle,
                        linkedin: data.linkedin,
                        createdAt: new Date(),
                    };

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw new Error("Échec de l'inscription du candidat");
                }
            },

            /**
             * Inscription d'une nouvelle entreprise
             * @param data - Données d'inscription de l'entreprise
             */
            registerEntreprise: async (data: RegisterEntrepriseData) => {
                set({ isLoading: true });
                try {
                    // Simulation d'un appel API
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    const user: User = {
                        id: Date.now().toString(),
                        userType: "entreprise",
                        nomEntreprise: data.nomEntreprise,
                        siret: data.siret,
                        nomGerant: data.nomGerant,
                        email: data.email,
                        localisation: data.localisation,
                        image: data.image,
                        linkedin: data.linkedin,
                        siteWeb: data.siteWeb,
                        createdAt: new Date(),
                    };

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw new Error("Échec de l'inscription de l'entreprise");
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
