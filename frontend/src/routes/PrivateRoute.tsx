import React, { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";

interface PrivateRouteProps {
    children: ReactNode;
    /** Page de redirection si non authentifié */
    redirectTo?: string;
}

/**
 * Composant pour les routes privées
 * Nécessite d'être authentifié mais sans restriction de rôle
 * Utilisé pour les pages comme le profil, les paramètres, etc.
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, redirectTo = "/login" }) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    // Afficher un loader pendant la vérification de l'authentification
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Rediriger vers la page de connexion si non authentifié
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
