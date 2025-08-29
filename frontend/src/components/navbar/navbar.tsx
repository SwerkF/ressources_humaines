import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { Menu, X, Home, Briefcase, LogIn, UserPlus, LogOut, User, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();

    const navItems = [
        { name: "Accueil", icon: Home, href: "/" },
        { name: "Offres d'emploi", icon: Briefcase, href: "/jobs" },
    ];

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
    };

    const handleDemoLogin = async () => {
        const { login } = useAuthStore.getState();
        try {
            await login({ email: "demo@traverselarue.fr", password: "password" });
        } catch (error) {
            console.error("Erreur de connexion:", error);
        }
    };

    const handleDemoCompanyLogin = async () => {
        const { registerEntreprise } = useAuthStore.getState();
        try {
            await registerEntreprise({
                nomEntreprise: "TechCorp",
                siret: "12345678900001",
                nomGerant: "Jean Dupont",
                email: "contact@techcorp.fr",
                password: "password",
                localisation: "Paris, France",
                image: "https://placehold.co/400",
                linkedin: "https://linkedin.com/company/techcorp",
                siteWeb: "https://techcorp.fr",
            });
        } catch (error) {
            console.error("Erreur de connexion entreprise:", error);
        }
    };

    const handleDemoAdminLogin = async () => {
        const { login } = useAuthStore.getState();
        try {
            await login({ email: "demo@traverselarue.fr", password: "password" });
        } catch (error) {
            console.error("Erreur de connexion admin:", error);
        }
    };

    return (
        <nav className="bg-white dark:bg-zinc-950 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        {/* Logo et titre */}
                        <div className="flex items-center">
                            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                                TLR
                            </h1>
                        </div>

                        {/* Navigation desktop */}
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-baseline space-x-4">
                                {navItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                                        >
                                            <IconComponent className="h-4 w-4 mr-2" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Actions à droite */}
                    <div className="flex items-center space-x-4">
                        <AnimatedThemeToggler className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200" />

                        {/* Boutons d'authentification - Desktop */}
                        <div className="hidden md:flex items-center space-x-3">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-3">
                                        {/* Liens spécifiques selon le type d'utilisateur */}
                                        {user?.userType === "candidat" && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to="/profile">
                                                    <User className="h-4 w-4 mr-2" />
                                                    Mon Profil
                                                </Link>
                                            </Button>
                                        )}

                                        {user?.userType === "entreprise" && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to="/dashboard">
                                                    <Briefcase className="h-4 w-4 mr-2" />
                                                    Dashboard
                                                </Link>
                                            </Button>
                                        )}

                                        {/* Bouton Admin pour les utilisateurs autorisés */}
                                        {user?.email &&
                                            (user.email === "demo@traverselarue.fr" ||
                                                user.email === "admin@traverselarue.fr" ||
                                                user.email === "superadmin@traverselarue.fr") && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="text-primary"
                                                >
                                                    <Link to="/admin">
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Admin
                                                    </Link>
                                                </Button>
                                            )}

                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {user?.userType === "candidat"
                                                    ? `${user.prenom} ${user.nom}`
                                                    : user?.userType === "entreprise"
                                                      ? user.nomEntreprise
                                                      : "Utilisateur"}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="flex items-center space-x-1"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Déconnexion</span>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDemoLogin}
                                        className="flex items-center space-x-1"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        <span>Connexion</span>
                                    </Button>
                                    <Button size="sm" className="flex items-center space-x-1">
                                        <Link
                                            to="/register"
                                            className="flex items-center space-x-1"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            <span>Inscription</span>
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleDemoLogin}>
                                        Démo Candidat
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDemoCompanyLogin}
                                    >
                                        Démo Entreprise
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDemoAdminLogin}
                                        className="text-primary border-primary hover:bg-primary hover:text-white"
                                    >
                                        <Shield className="h-4 w-4 mr-1" />
                                        Démo Admin
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Bouton menu mobile */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu mobile */}
                <div
                    className={cn(
                        "md:hidden transition-all duration-300 ease-in-out",
                        isMobileMenuOpen
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0 overflow-hidden",
                    )}
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-zinc-200 dark:border-zinc-700">
                        {/* Navigation links */}
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <IconComponent className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}

                        {/* Séparateur */}
                        <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>

                        {/* Boutons d'authentification - Mobile */}
                        {isAuthenticated ? (
                            <div className="space-y-1">
                                <div className="flex items-center px-3 py-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
                                        {user?.userType === "candidat"
                                            ? `${user.prenom} ${user.nom}`
                                            : user?.userType === "entreprise"
                                              ? user.nomEntreprise
                                              : "Utilisateur"}
                                    </span>
                                </div>

                                {/* Liens spécifiques selon le type d'utilisateur - Mobile */}
                                {user?.userType === "candidat" && (
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="h-5 w-5 mr-3" />
                                        Mon Profil
                                    </Link>
                                )}

                                {user?.userType === "entreprise" && (
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Briefcase className="h-5 w-5 mr-3" />
                                        Dashboard
                                    </Link>
                                )}

                                {/* Bouton Admin pour les utilisateurs autorisés - Mobile */}
                                {user?.email &&
                                    (user.email === "demo@traverselarue.fr" ||
                                        user.email === "admin@traverselarue.fr" ||
                                        user.email === "superadmin@traverselarue.fr") && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Shield className="h-5 w-5 mr-3" />
                                            Admin Dashboard
                                        </Link>
                                    )}

                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Déconnexion
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleDemoLogin}
                                >
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Connexion
                                </Button>
                                <Button className="w-full justify-start">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Inscription
                                </Button>

                                {/* Boutons démo - Mobile */}
                                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            handleDemoLogin();
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Démo Candidat
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            handleDemoCompanyLogin();
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Démo Entreprise
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-primary border-primary hover:bg-primary hover:text-white"
                                        onClick={() => {
                                            handleDemoAdminLogin();
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Démo Admin
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
