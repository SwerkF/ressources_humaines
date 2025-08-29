import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

interface GuestRouteProps {
    children: ReactNode;
    /** Page de redirection si déjà authentifié */
    redirectTo?: string;
}

/**
 * Composant pour les routes d'invité
 * Redirige vers la page d'accueil si l'utilisateur est déjà authentifié
 * Utilisé pour les pages de connexion et d'inscription
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children, redirectTo = "/dashboard" }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Afficher un loader pendant la vérification de l'authentification
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Rediriger si déjà authentifié
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};
