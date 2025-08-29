import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import { SmoothCursor } from "./components/ui/smooth-cursor";
import { PublicRoute, GuestRoute, PrivateRoute, ProtectedRoute } from "./routes";

import { type JSX } from "react";
import Home from "./pages/home";
import AuthPage from "@/pages/AuthPage";
import JobsPage from "@/pages/JobsPage";
import ProfilePage from "@/pages/ProfilePage";
import CompanyDashboard from "@/pages/CompanyDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

/**
 * Composant principal de l'application.
 * Gère la navigation via React Router.
 * @returns {JSX.Element}
 */
function App(): JSX.Element {
    return (
        <Router>
            <SmoothCursor />
            <div className="flex flex-col h-screen w-full">
                <Navbar />
                <div className="flex-1">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <PublicRoute>
                                    <Home />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <GuestRoute>
                                    <AuthPage />
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <GuestRoute>
                                    <AuthPage />
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/jobs"
                            element={
                                <PublicRoute>
                                    <JobsPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <ProfilePage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={["recruteur"]}>
                                    <CompanyDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
