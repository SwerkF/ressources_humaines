import { useState, useEffect, type JSX } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";
import type { UserType } from "@/types/auth";
import { CandidatRegisterForm, EntrepriseRegisterForm, LoginForm } from "@/components/auth";

type AuthMode = "select" | "register" | "login";

/**
 * Page d'authentification principale gérant inscription et connexion
 * @returns {JSX.Element}
 */
export default function AuthPage(): JSX.Element {
    const location = useLocation();
    const [mode, setMode] = useState<AuthMode>("select");
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

    // Détecter si on vient de /login pour afficher directement le formulaire de connexion
    useEffect(() => {
        if (location.pathname === "/login") {
            setMode("login");
        }
    }, [location.pathname]);

    /**
     * Gère la sélection du type d'utilisateur et passe au mode inscription
     * @param userType - Type d'utilisateur sélectionné
     */
    const handleUserTypeSelect = (userType: UserType): void => {
        setSelectedUserType(userType);
        setMode("register");
    };

    /**
     * Retourne à la sélection du type d'utilisateur
     */
    const handleBack = (): void => {
        setMode("select");
        setSelectedUserType(null);
    };

    /**
     * Passe au mode connexion
     */
    const handleShowLogin = (): void => {
        setMode("login");
    };

    /**
     * Passe au mode sélection depuis la connexion
     */
    const handleShowRegister = (): void => {
        setMode("select");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {mode === "select" && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
                            <p className="text-muted-foreground">
                                Choisissez le type de compte qui vous correspond
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Carte Candidat */}
                            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50">
                                <CardHeader className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                        <User className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <CardTitle className="text-xl">Je cherche un emploi</CardTitle>
                                    <CardDescription>
                                        Créez votre profil candidat pour postuler aux offres
                                        d'emploi
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li>• Rechercher des offres d'emploi</li>
                                        <li>• Postuler en un clic</li>
                                        <li>• Suivre vos candidatures</li>
                                        <li>• Recevoir des recommandations</li>
                                    </ul>
                                    <Button
                                        onClick={() => handleUserTypeSelect("candidat")}
                                        className="w-full"
                                        size="lg"
                                    >
                                        S'inscrire comme candidat
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Carte Entreprise */}
                            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50">
                                <CardHeader className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                        <Building2 className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <CardTitle className="text-xl">Je recrute</CardTitle>
                                    <CardDescription>
                                        Créez votre compte entreprise pour publier vos offres
                                        d'emploi
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li>• Publier des offres d'emploi</li>
                                        <li>• Gérer les candidatures</li>
                                        <li>• Rechercher des profils</li>
                                        <li>• Outils de recrutement avancés</li>
                                    </ul>
                                    <Button
                                        onClick={() => handleUserTypeSelect("entreprise")}
                                        className="w-full"
                                        size="lg"
                                    >
                                        S'inscrire comme entreprise
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Vous avez déjà un compte ?{" "}
                                <button
                                    onClick={handleShowLogin}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Se connecter
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {mode === "register" && selectedUserType === "candidat" && (
                    <CandidatRegisterForm onBack={handleBack} />
                )}

                {mode === "register" && selectedUserType === "entreprise" && (
                    <EntrepriseRegisterForm onBack={handleBack} />
                )}

                {mode === "login" && <LoginForm onShowRegister={handleShowRegister} />}
            </div>
        </div>
    );
}
