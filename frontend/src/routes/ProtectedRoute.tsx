import React, { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

interface ProtectedRouteProps {
    children: ReactNode;
    /** Rôles autorisés à accéder à cette route */
    allowedRoles?: ("admin" | "recruteur" | "candidat")[];
    /** Page de redirection si non authentifié */
    redirectTo?: string;
}

/**
 * Composant de protection des routes
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 * ou n'a pas les permissions nécessaires
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    redirectTo = "/login",
}) => {
    const { isAuthenticated, isLoading, user } = useAuthStore();
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

    // Vérifier les permissions de rôle si spécifiées
    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
                    <p className="text-gray-600">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
