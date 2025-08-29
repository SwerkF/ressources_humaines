import React, { type ReactNode } from "react";

interface PublicRouteProps {
    children: ReactNode;
}

/**
 * Composant pour les routes publiques
 * Ces routes sont accessibles à tous, qu'ils soient connectés ou non
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    return <>{children}</>;
};
