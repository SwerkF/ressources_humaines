import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import { SmoothCursor } from "./components/ui/smooth-cursor";

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
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<AuthPage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/jobs" element={<JobsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/dashboard" element={<CompanyDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
