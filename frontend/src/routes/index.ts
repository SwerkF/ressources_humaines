/**
 * Exports des composants de routage
 *
 * - PublicRoute: Routes accessibles à tous (connectés ou non)
 * - GuestRoute: Routes pour invités uniquement (non connectés)
 * - PrivateRoute: Routes privées (connectés uniquement, sans restriction de rôle)
 * - ProtectedRoute: Routes protégées (connectés + vérification de rôle)
 */

export { PublicRoute } from "./PublicRoute";
export { GuestRoute } from "./GuestRoute";
export { PrivateRoute } from "./PrivateRoute";
export { ProtectedRoute } from "./ProtectedRoute";
