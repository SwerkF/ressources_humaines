import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

/**
 * Composant pour initialiser l'authentification au démarrage de l'application
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { initAuth, isLoading } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    // Afficher un loader pendant l'initialisation
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
};
