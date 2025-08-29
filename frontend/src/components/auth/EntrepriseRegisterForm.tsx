import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { RegisterEntrepriseData } from "@/types/auth";

interface EntrepriseRegisterFormProps {
    onBack: () => void;
}

/**
 * Formulaire d'inscription pour les entreprises
 * @param onBack - Fonction appelée pour revenir à la sélection
 * @returns {JSX.Element}
 */
export default function EntrepriseRegisterForm({
    onBack,
}: EntrepriseRegisterFormProps): JSX.Element {
    const { registerEntreprise, isLoading } = useAuthStore();
    const [formData, setFormData] = useState<RegisterEntrepriseData>({
        email: "",
        password: "",
        nom_entreprise: "",
        siret: "",
        nom_gerant: "",
        email_professionnel: "",
        localisation: "",
        logo: undefined,
        site_web: "",
    });
    const [error, setError] = useState<string>("");

    /**
     * Gère les changements dans les champs du formulaire
     * @param field - Nom du champ
     * @param value - Nouvelle valeur
     */
    const handleInputChange = (field: keyof RegisterEntrepriseData, value: string): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) setError("");
    };

    /**
     * Gère l'upload du fichier logo
     * @param e - Événement de changement de fichier
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        setFormData((prev) => ({ ...prev, logo: file }));
        if (error) setError("");
    };

    /**
     * Gère la soumission du formulaire
     * @param e - Événement de soumission
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");

        // Validation basique
        if (
            !formData.nom_entreprise ||
            !formData.siret ||
            !formData.nom_gerant ||
            !formData.email ||
            !formData.email_professionnel ||
            !formData.password ||
            !formData.localisation
        ) {
            setError("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            await registerEntreprise(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Inscription Entreprise</h1>
                            <p className="text-muted-foreground">
                                Créez votre compte pour publier vos offres
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="nomEntreprise">Nom de l'entreprise *</Label>
                        <Input
                            id="nomEntreprise"
                            type="text"
                            value={formData.nom_entreprise}
                            onChange={(e) => handleInputChange("nom_entreprise", e.target.value)}
                            placeholder="Ex: TechCorp Solutions"
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="siret">SIRET *</Label>
                            <Input
                                id="siret"
                                type="text"
                                value={formData.siret}
                                onChange={(e) => handleInputChange("siret", e.target.value)}
                                placeholder="123 456 789 00001"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nomGerant">Nom du gérant *</Label>
                            <Input
                                id="nomGerant"
                                type="text"
                                value={formData.nom_gerant}
                                onChange={(e) => handleInputChange("nom_gerant", e.target.value)}
                                placeholder="Prénom Nom"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email personnel *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="votre.email@exemple.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emailProfessionnel">Email professionnel *</Label>
                            <Input
                                id="emailProfessionnel"
                                type="email"
                                value={formData.email_professionnel}
                                onChange={(e) =>
                                    handleInputChange("email_professionnel", e.target.value)
                                }
                                placeholder="contact@entreprise.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="localisation">Localisation *</Label>
                        <Input
                            id="localisation"
                            type="text"
                            value={formData.localisation}
                            onChange={(e) => handleInputChange("localisation", e.target.value)}
                            placeholder="Ex: Paris, France"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo de l'entreprise (optionnel)</Label>
                        <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                            Formats acceptés : JPG, JPEG, PNG, GIF - Taille max : 5MB
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="siteWeb">Site web (optionnel)</Label>
                        <Input
                            id="siteWeb"
                            type="url"
                            value={formData.site_web}
                            onChange={(e) => handleInputChange("site_web", e.target.value)}
                            placeholder="https://entreprise.com"
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Créer mon compte entreprise
                    </Button>
                </form>
            </div>
        </div>
    );
}
