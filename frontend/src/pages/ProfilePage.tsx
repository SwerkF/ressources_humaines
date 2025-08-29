import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    User as UserIcon,
    Mail,
    Building2,
    Briefcase,
    MapPin,
    Globe,
    Linkedin,
    Save,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/types/auth";

/**
 * Page de profil utilisateur pour modifier ses informations
 * @returns {JSX.Element}
 */
export default function ProfilePage(): JSX.Element {
    const navigate = useNavigate();
    const { user, isAuthenticated, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // États pour les formulaires
    const [candidatData, setCandidatData] = useState<Partial<User>>({});
    const [entrepriseData, setEntrepriseData] = useState<Partial<User>>({});

    // Redirection si non authentifié
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        // Initialiser les données selon le type d'utilisateur
        if (user?.role === "candidat") {
            setCandidatData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                date_naissance: user.date_naissance,
                poste_actuel: user.poste_actuel,
                entreprise_actuelle: user.entreprise_actuelle,
                linkedin: user.linkedin || "",
            });
        } else if (user?.role === "recruteur") {
            setEntrepriseData({
                nom_entreprise: user.nom_entreprise,
                siret: user.siret,
                nom_gerant: user.nom_gerant,
                email: user.email,
                email_professionnel: user.email_professionnel,
                localisation: user.localisation,
                logo: user.logo || "",
                site_web: user.site_web || "",
            });
        }
    }, [isAuthenticated, user, navigate]);

    /**
     * Met à jour les données candidat
     * @param field - Champ à mettre à jour
     * @param value - Nouvelle valeur
     */
    const updateCandidatData = (field: keyof User, value: string): void => {
        setCandidatData((prev: Partial<User>) => ({ ...prev, [field]: value }));
    };

    /**
     * Met à jour les données entreprise
     * @param field - Champ à mettre à jour
     * @param value - Nouvelle valeur
     */
    const updateEntrepriseData = (field: keyof User, value: string): void => {
        setEntrepriseData((prev: Partial<User>) => ({ ...prev, [field]: value }));
    };

    /**
     * Sauvegarde les modifications du profil
     */
    const handleSave = async (): Promise<void> => {
        setIsLoading(true);
        setError("");

        try {
            // Déterminer les données à envoyer selon le type d'utilisateur
            const dataToUpdate = user?.role === "candidat" ? candidatData : entrepriseData;

            // Filtrer les champs vides et undefined pour n'envoyer que les modifications
            const filteredData = Object.fromEntries(
                Object.entries(dataToUpdate).filter(([_, value]) => value !== "" && value != null),
            );

            console.log("Données à sauvegarder:", filteredData);

            // Appel API pour sauvegarder
            await updateProfile(filteredData);

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err: any) {
            console.error("Erreur lors de la sauvegarde:", err);
            setError(
                err?.detail || err?.message || "Erreur lors de la sauvegarde des modifications",
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Retour à la page précédente
     */
    const handleBack = (): void => {
        navigate(-1);
    };

    if (!isAuthenticated || !user) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Mon Profil</h1>
                        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                        {error}
                    </div>
                )}

                {isSaved && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                        ✅ Profil mis à jour avec succès !
                    </div>
                )}

                {/* Formulaire Candidat */}
                {user.role === "candidat" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                Informations personnelles
                            </CardTitle>
                            <CardDescription>Modifiez vos informations de candidat</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="prenom">Prénom</Label>
                                    <Input
                                        id="prenom"
                                        value={candidatData.first_name || ""}
                                        onChange={(e) =>
                                            updateCandidatData("first_name", e.target.value)
                                        }
                                        placeholder="Votre prénom"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nom">Nom</Label>
                                    <Input
                                        id="nom"
                                        value={candidatData.last_name || ""}
                                        onChange={(e) =>
                                            updateCandidatData("last_name", e.target.value)
                                        }
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={candidatData.email || ""}
                                        onChange={(e) =>
                                            updateCandidatData("email", e.target.value)
                                        }
                                        placeholder="votre.email@exemple.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateNaissance">Date de naissance</Label>
                                <Input
                                    id="dateNaissance"
                                    type="date"
                                    value={candidatData.date_naissance || ""}
                                    onChange={(e) =>
                                        updateCandidatData("date_naissance", e.target.value)
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="posteActuel">Poste actuel</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="posteActuel"
                                            value={candidatData.poste_actuel || ""}
                                            onChange={(e) =>
                                                updateCandidatData("poste_actuel", e.target.value)
                                            }
                                            placeholder="Ex: Développeur Frontend"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="entrepriseActuelle">Entreprise actuelle</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="entrepriseActuelle"
                                            value={candidatData.entreprise_actuelle || ""}
                                            onChange={(e) =>
                                                updateCandidatData(
                                                    "entreprise_actuelle",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ex: TechCorp"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn (optionnel)</Label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="linkedin"
                                        type="url"
                                        value={candidatData.linkedin || ""}
                                        onChange={(e) =>
                                            updateCandidatData("linkedin", e.target.value)
                                        }
                                        placeholder="https://linkedin.com/in/votre-profil"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Formulaire Entreprise */}
                {user.role === "recruteur" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informations entreprise
                            </CardTitle>
                            <CardDescription>
                                Modifiez les informations de votre entreprise
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nomEntreprise">Nom de l'entreprise</Label>
                                <Input
                                    id="nomEntreprise"
                                    value={entrepriseData.nom_entreprise || ""}
                                    onChange={(e) =>
                                        updateEntrepriseData("nom_entreprise", e.target.value)
                                    }
                                    placeholder="Ex: TechCorp Solutions"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siret">SIRET</Label>
                                    <Input
                                        id="siret"
                                        value={entrepriseData.siret || ""}
                                        onChange={(e) =>
                                            updateEntrepriseData("siret", e.target.value)
                                        }
                                        placeholder="123 456 789 00001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nomGerant">Nom du gérant</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="nomGerant"
                                            value={entrepriseData.nom_gerant || ""}
                                            onChange={(e) =>
                                                updateEntrepriseData("nom_gerant", e.target.value)
                                            }
                                            placeholder="Prénom Nom"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email principal</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={entrepriseData.email || ""}
                                            onChange={(e) =>
                                                updateEntrepriseData("email", e.target.value)
                                            }
                                            placeholder="votre.email@exemple.com"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emailProfessionnel">Email professionnel</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="emailProfessionnel"
                                            type="email"
                                            value={entrepriseData.email_professionnel || ""}
                                            onChange={(e) =>
                                                updateEntrepriseData(
                                                    "email_professionnel",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="contact@entreprise.com"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="localisation">Localisation</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="localisation"
                                        value={entrepriseData.localisation || ""}
                                        onChange={(e) =>
                                            updateEntrepriseData("localisation", e.target.value)
                                        }
                                        placeholder="Ex: Paris, France"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo de l'entreprise (URL)</Label>
                                <Input
                                    id="logo"
                                    type="url"
                                    value={entrepriseData.logo || ""}
                                    onChange={(e) => updateEntrepriseData("logo", e.target.value)}
                                    placeholder="https://exemple.com/logo.png"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn (optionnel)</Label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="linkedin"
                                            type="url"
                                            value={entrepriseData.linkedin || ""}
                                            onChange={(e) =>
                                                updateEntrepriseData("linkedin", e.target.value)
                                            }
                                            placeholder="https://linkedin.com/company/entreprise"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteWeb">Site web (optionnel)</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="siteWeb"
                                            type="url"
                                            value={entrepriseData.site_web || ""}
                                            onChange={(e) =>
                                                updateEntrepriseData("site_web", e.target.value)
                                            }
                                            placeholder="https://entreprise.com"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bouton de sauvegarde */}
                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} size="lg">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Sauvegarder les modifications
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
