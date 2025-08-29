import { useState, useRef, type JSX } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    Upload,
    FileText,
    Mail,
    Send,
    AlertCircle,
    CheckCircle2,
    X,
    Loader2,
} from "lucide-react";
import type { Job } from "@/types/job";
import { candidatureService, type CreateCandidatureData } from "@/services/candidatureService";
import { useAuthStore } from "@/store/auth";

interface ApplicationModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onApplicationSubmitted?: () => void;
}

/**
 * Modal pour postuler à une offre d'emploi
 * Permet l'upload d'un CV obligatoire et d'une lettre de motivation optionnelle
 */
export default function ApplicationModal({
    job,
    isOpen,
    onClose,
    onApplicationSubmitted,
}: ApplicationModalProps): JSX.Element {
    const { user } = useAuthStore();
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [lettreFile, setLettreFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const cvInputRef = useRef<HTMLInputElement>(null);
    const lettreInputRef = useRef<HTMLInputElement>(null);

    /**
     * Gère la sélection du fichier CV
     */
    const handleCvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validationError = candidatureService.validateFile(file, 'cv');
            if (validationError) {
                setError(validationError);
                setCvFile(null);
                return;
            }
            setCvFile(file);
            setError(null);
        }
    };

    /**
     * Gère la sélection du fichier lettre de motivation
     */
    const handleLettreFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validationError = candidatureService.validateFile(file, 'lettre');
            if (validationError) {
                setError(validationError);
                setLettreFile(null);
                return;
            }
            setLettreFile(file);
            setError(null);
        }
    };

    /**
     * Supprime le fichier CV sélectionné
     */
    const removeCvFile = () => {
        setCvFile(null);
        if (cvInputRef.current) {
            cvInputRef.current.value = "";
        }
    };

    /**
     * Supprime le fichier lettre sélectionné
     */
    const removeLettreFile = () => {
        setLettreFile(null);
        if (lettreInputRef.current) {
            lettreInputRef.current.value = "";
        }
    };

    /**
     * Formate la taille d'un fichier en format lisible
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    /**
     * Soumet la candidature
     */
    const handleSubmit = async () => {
        if (!job || !cvFile) {
            setError("Le CV est obligatoire pour postuler");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        setUploadProgress(0);

        try {
            // Simulation du progrès d'upload
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const candidatureData: CreateCandidatureData = {
                job: job.id,
                cv: cvFile,
                ...(lettreFile && { lettre_motivation: lettreFile }),
            };

            const result = await candidatureService.createCandidature(candidatureData);
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            setSuccess(result.message);
            
            // Réinitialiser le formulaire après un délai
            setTimeout(() => {
                resetForm();
                onClose();
                onApplicationSubmitted?.();
            }, 2000);

        } catch (error: any) {
            setError(error.message || "Erreur lors de l'envoi de la candidature");
            setUploadProgress(0);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Réinitialise le formulaire
     */
    const resetForm = () => {
        setCvFile(null);
        setLettreFile(null);
        setMessage("");
        setError(null);
        setSuccess(null);
        setUploadProgress(0);
        setIsSubmitting(false);
        
        if (cvInputRef.current) cvInputRef.current.value = "";
        if (lettreInputRef.current) lettreInputRef.current.value = "";
    };

    /**
     * Ferme la modal avec réinitialisation
     */
    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    if (!job) return <></>;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Postuler à l'offre
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Informations sur l'offre */}
                    <div className="p-3 bg-muted/30 rounded-lg">
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>

                    {/* Informations du candidat */}
                    <div className="space-y-2">
                        <Label>Candidat</Label>
                        <div className="p-3 border rounded-lg bg-background">
                            <p className="font-medium">
                                {user?.role === 'candidat' 
                                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                    : 'Utilisateur'
                                }
                            </p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    {/* Upload CV */}
                    <div className="space-y-2">
                        <Label htmlFor="cv-upload">
                            CV <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                            <Input
                                ref={cvInputRef}
                                id="cv-upload"
                                type="file"
                                accept=".pdf"
                                onChange={handleCvFileChange}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            />
                            {cvFile && (
                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium">{cvFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(cvFile.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeCvFile}
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Format PDF uniquement, taille maximale 5MB
                        </p>
                    </div>

                    {/* Upload Lettre de motivation */}
                    <div className="space-y-2">
                        <Label htmlFor="lettre-upload">Lettre de motivation (optionnelle)</Label>
                        <div className="space-y-2">
                            <Input
                                ref={lettreInputRef}
                                id="lettre-upload"
                                type="file"
                                accept=".pdf"
                                onChange={handleLettreFileChange}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            />
                            {lettreFile && (
                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium">{lettreFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(lettreFile.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeLettreFile}
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message personnalisé */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message personnalisé (optionnel)</Label>
                        <Textarea
                            id="message"
                            placeholder="Écrivez un message pour accompagner votre candidature..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSubmitting}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Ce message sera visible par le recruteur
                        </p>
                    </div>

                    {/* Barre de progression */}
                    {isSubmitting && uploadProgress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Envoi en cours...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}

                    {/* Messages d'erreur et de succès */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50 text-green-800">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Boutons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!cvFile || isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Postuler
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}