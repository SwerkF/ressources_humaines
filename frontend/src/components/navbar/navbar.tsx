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

    /**
     * Récupère le logo de l'utilisateur connecté ou génère un fallback
     */
    const getUserLogo = () => {
        if (!user) return null;
        
        // Pour les recruteurs, utiliser leur logo d'entreprise
        if (user.role === 'recruteur' && user.logo) {
            // Si c'est un chemin relatif, construire l'URL complète
            if (user.logo.startsWith('/')) {
                return `http://localhost:8000${user.logo}`;
            }
            if (user.logo.startsWith('http')) {
                return user.logo;
            }
            if (user.logo.includes('media/')) {
                return `http://localhost:8000/${user.logo}`;
            }
            return `http://localhost:8000/media/${user.logo}`;
        }
        
        // Fallback: génerer un avatar basé sur le nom
        const displayName = user.role === 'candidat' 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : user.role === 'recruteur'
            ? user.nom_entreprise || 'Entreprise'
            : user.email || 'Utilisateur';
            
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=random`;
    };

    const navItems = [
        { name: "Accueil", icon: Home, href: "/" },
        { name: "Offres d'emploi", icon: Briefcase, href: "/jobs" },
    ];

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
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
                                        {user?.role === "candidat" && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center space-x-1"
                                                >
                                                    <User className="h-4 w-4 mr-2" />
                                                    Mon Profil
                                                </Link>
                                            </Button>
                                        )}

                                        {user?.role === "recruteur" && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to="/dashboard">
                                                    <Briefcase className="h-4 w-4 mr-2" />
                                                    Dashboard
                                                </Link>
                                            </Button>
                                        )}

                                        {/* Bouton Admin pour les utilisateurs autorisés */}
                                        {user?.email &&
                                             (user?.role === "admin" &&
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
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                <img
                                                    src={getUserLogo() || `https://ui-avatars.com/api/?name=User&size=128&background=random`}
                                                    alt="Avatar utilisateur"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        const displayName = user?.role === 'candidat' 
                                                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                            : user?.role === 'recruteur'
                                                            ? user.nom_entreprise || 'Entreprise'
                                                            : 'User';
                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=random`;
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {user?.role === "candidat"
                                                    ? `${user.first_name} ${user.last_name}`
                                                    : user?.role === "recruteur"
                                                      ? user.nom_entreprise
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
                                        className="flex items-center space-x-1"
                                    >
                                        <Link to="/login" className="flex items-center space-x-1">
                                            <LogIn className="h-4 w-4" />
                                            <span>Connexion</span>
                                        </Link>
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
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 mr-3">
                                        <img
                                            src={getUserLogo() || `https://ui-avatars.com/api/?name=User&size=128&background=random`}
                                            alt="Avatar utilisateur"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback en cas d'erreur de chargement d'image
                                                const target = e.target as HTMLImageElement;
                                                const displayName = user?.role === 'candidat' 
                                                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                    : user?.role === 'recruteur'
                                                    ? user.nom_entreprise || 'Entreprise'
                                                    : 'User';
                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=random`;
                                            }}
                                        />
                                    </div>
                                    <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
                                        {user?.role === "candidat"
                                            ? `${user.first_name} ${user.last_name}`
                                            : user?.role === "recruteur"
                                              ? user.nom_entreprise
                                              : "Utilisateur"}
                                    </span>
                                </div>

                                {/* Liens spécifiques selon le type d'utilisateur - Mobile */}
                                {user?.role === "candidat" && (
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="h-5 w-5 mr-3" />
                                        Mon Profil
                                    </Link>
                                )}

                                {user?.role === "recruteur" && (
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
                                {user?.role === "admin" && (
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
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/login" className="flex items-center space-x-1">
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Connexion
                                    </Link>
                                </Button>
                                <Button className="w-full justify-start" asChild>
                                    <Link to="/register" className="flex items-center space-x-1">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Inscription
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
