import { useState, type JSX } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Upload,
    FileText,
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Send,
    Loader2,
    CheckCircle,
    X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { Job } from "@/types/job";
import type { ApplicationFormData, ApplicationCandidatInfo } from "@/types/application";

interface ApplicationModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal de candidature pour postuler à une offre d'emploi
 * @param job - Offre d'emploi pour laquelle postuler
 * @param isOpen - État d'ouverture de la modal
 * @param onClose - Fonction appelée pour fermer la modal
 * @returns {JSX.Element}
 */
export default function ApplicationModal({
    job,
    isOpen,
    onClose,
}: ApplicationModalProps): JSX.Element {
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Initialisation des données candidat depuis le store auth
    const [formData, setFormData] = useState<ApplicationFormData>(() => {
        // Pré-remplissage uniquement si l'utilisateur est connecté et est un candidat
        if (user?.userType === "candidat") {
            return {
                coverLetter: "",
                cvFile: null,
                candidatInfo: {
                    prenom: user.prenom,
                    nom: user.nom,
                    email: user.email,
                    telephone: "",
                    posteActuel: user.posteActuel,
                    entrepriseActuelle: user.entrepriseActuelle,
                    linkedin: user.linkedin || "",
                },
                acceptTerms: false,
            };
        }

        // Formulaire vide si pas connecté ou pas candidat
        return {
            coverLetter: "",
            cvFile: null,
            candidatInfo: {
                prenom: "",
                nom: "",
                email: "",
                telephone: "",
                posteActuel: "",
                entrepriseActuelle: "",
                linkedin: "",
            },
            acceptTerms: false,
        };
    });

    /**
     * Met à jour les informations du candidat
     * @param field - Champ à mettre à jour
     * @param value - Nouvelle valeur
     */
    const updateCandidatInfo = (field: keyof ApplicationCandidatInfo, value: string): void => {
        setFormData((prev) => ({
            ...prev,
            candidatInfo: {
                ...prev.candidatInfo,
                [field]: value,
            },
        }));
    };

    /**
     * Gère l'upload du fichier CV
     * @param e - Événement de changement de fichier
     */
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            // Vérification du type de fichier
            const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedTypes.includes(file.type)) {
                setError("Veuillez sélectionner un fichier PDF ou Word (.doc, .docx)");
                return;
            }

            // Vérification de la taille (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError("Le fichier ne doit pas dépasser 5MB");
                return;
            }

            setFormData((prev) => ({ ...prev, cvFile: file }));
            setError("");
        }
    };

    /**
     * Supprime le fichier CV sélectionné
     */
    const removeCvFile = (): void => {
        setFormData((prev) => ({ ...prev, cvFile: null }));
    };

    /**
     * Valide le formulaire avant soumission
     */
    const validateForm = (): boolean => {
        if (
            !formData.candidatInfo.prenom ||
            !formData.candidatInfo.nom ||
            !formData.candidatInfo.email
        ) {
            setError("Veuillez remplir tous les champs obligatoires");
            return false;
        }

        if (!formData.cvFile) {
            setError("Veuillez joindre votre CV");
            return false;
        }

        if (!formData.acceptTerms) {
            setError("Veuillez accepter les conditions générales");
            return false;
        }

        return true;
    };

    /**
     * Soumet la candidature
     */
    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError("");

        try {
            // Simulation d'envoi de candidature
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Simulation de succès
            setIsSubmitted(true);

            // Auto-fermeture après 2 secondes
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError("Une erreur est survenue lors de l'envoi de votre candidature");
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Ferme la modal et remet à zéro l'état
     */
    const handleClose = (): void => {
        setIsSubmitted(false);
        setError("");
        setFormData((prev) => ({
            ...prev,
            coverLetter: "",
            cvFile: null,
            acceptTerms: false,
        }));
        onClose();
    };

    /**
     * Formate la taille du fichier
     * @param bytes - Taille en bytes
     * @returns Taille formatée
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (!job) return <></>;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {isSubmitted ? (
                    // Écran de confirmation
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <DialogTitle className="text-xl mb-2">Candidature envoyée !</DialogTitle>
                        <DialogDescription className="text-base">
                            Votre candidature pour le poste de <strong>{job.title}</strong> chez{" "}
                            <strong>{job.company}</strong> a été envoyée avec succès.
                            <br />
                            Vous recevrez une confirmation par email.
                        </DialogDescription>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Postuler à cette offre
                            </DialogTitle>
                            <DialogDescription>
                                Complétez votre candidature pour le poste de{" "}
                                <strong>{job.title}</strong> chez <strong>{job.company}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Récapitulatif de l'offre */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={job.image}
                                        alt={`Logo ${job.company}`}
                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{job.title}</h3>
                                        <p className="text-muted-foreground">{job.company}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="secondary">{job.contract}</Badge>
                                            <Badge variant="outline">{job.work}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Informations personnelles */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <h3 className="font-semibold">Vos informations</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="prenom">Prénom *</Label>
                                        <Input
                                            id="prenom"
                                            value={formData.candidatInfo.prenom}
                                            onChange={(e) =>
                                                updateCandidatInfo("prenom", e.target.value)
                                            }
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">Nom *</Label>
                                        <Input
                                            id="nom"
                                            value={formData.candidatInfo.nom}
                                            onChange={(e) =>
                                                updateCandidatInfo("nom", e.target.value)
                                            }
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.candidatInfo.email}
                                                onChange={(e) =>
                                                    updateCandidatInfo("email", e.target.value)
                                                }
                                                placeholder="votre.email@exemple.com"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone">Téléphone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="telephone"
                                                type="tel"
                                                value={formData.candidatInfo.telephone}
                                                onChange={(e) =>
                                                    updateCandidatInfo("telephone", e.target.value)
                                                }
                                                placeholder="06 12 34 56 78"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="posteActuel">Poste actuel</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="posteActuel"
                                                value={formData.candidatInfo.posteActuel}
                                                onChange={(e) =>
                                                    updateCandidatInfo(
                                                        "posteActuel",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ex: Développeur Frontend"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="entrepriseActuelle">
                                            Entreprise actuelle
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="entrepriseActuelle"
                                                value={formData.candidatInfo.entrepriseActuelle}
                                                onChange={(e) =>
                                                    updateCandidatInfo(
                                                        "entrepriseActuelle",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ex: TechCorp"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Upload CV */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <h3 className="font-semibold">Votre CV *</h3>
                                </div>

                                {!formData.cvFile ? (
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Glissez-déposez votre CV ou cliquez pour sélectionner
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Formats acceptés: PDF, DOC, DOCX (max 5MB)
                                        </p>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="cv-upload"
                                        />
                                        <Button variant="outline" asChild>
                                            <label htmlFor="cv-upload" className="cursor-pointer">
                                                Sélectionner un fichier
                                            </label>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-primary" />
                                            <div>
                                                <p className="font-medium">
                                                    {formData.cvFile.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFileSize(formData.cvFile.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeCvFile}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Lettre de motivation */}
                            <div className="space-y-4">
                                <Label htmlFor="coverLetter">
                                    Lettre de motivation (optionnelle)
                                </Label>
                                <Textarea
                                    id="coverLetter"
                                    placeholder="Expliquez pourquoi ce poste vous intéresse et ce que vous pouvez apporter à l'entreprise..."
                                    value={formData.coverLetter}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            coverLetter: e.target.value,
                                        }))
                                    }
                                    className="min-h-[120px]"
                                />
                            </div>

                            {/* Conditions générales */}
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            acceptTerms: checked as boolean,
                                        }))
                                    }
                                />
                                <Label htmlFor="acceptTerms" className="text-sm leading-5">
                                    J'accepte les conditions générales d'utilisation et autorise le
                                    traitement de mes données personnelles dans le cadre de cette
                                    candidature.
                                </Label>
                            </div>

                            {/* Message d'erreur */}
                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Annuler
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
