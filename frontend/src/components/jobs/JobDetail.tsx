import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Clock,
    Briefcase,
    Euro,
    Calendar,
    Building2,
    Send,
    Bookmark,
    Share2,
    ExternalLink,
    CheckCircle,
} from "lucide-react";
import type { Job } from "@/types/job";
import { useAuthStore } from "@/store/auth";
import { candidatureService } from "@/services/candidatureService";
import ApplicationModal from "./ApplicationModal";

interface JobDetailProps {
    job: Job | null;
}

/**
 * Panneau de détails d'une offre d'emploi
 * @param job - Offre d'emploi à afficher (null si aucune sélection)
 * @returns {JSX.Element}
 */
export default function JobDetail({ job }: JobDetailProps): JSX.Element {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState<boolean>(false);
    const [hasApplied, setHasApplied] = useState<boolean>(false);
    const [isCheckingApplication, setIsCheckingApplication] = useState<boolean>(false);

    /**
     * Gère le clic sur le bouton "Postuler"
     * Vérifie l'authentification et redirige si nécessaire
     */
    const handleApplyClick = (): void => {
        if (!isAuthenticated) {
            // Rediriger vers la page de connexion
            navigate("/login");
            return;
        }

        // Vérifier que l'utilisateur est bien un candidat
        if (user?.role !== "candidat") {
            // Optionnel : afficher un message d'erreur ou rediriger
            console.warn("Seuls les candidats peuvent postuler aux offres");
            return;
        }

        // Ouvrir la modal de candidature
        setIsApplicationModalOpen(true);
    };

    /**
     * Ferme la modal de candidature
     */
    const handleCloseApplicationModal = (): void => {
        setIsApplicationModalOpen(false);
    };

    /**
     * Gère la soumission réussie d'une candidature
     */
    const handleApplicationSubmitted = (): void => {
        setHasApplied(true);
        // Optionnel: afficher une notification de succès
    };

    /**
     * Vérifie si l'utilisateur a déjà postulé pour cette offre
     */
    const checkApplicationStatus = async (jobId: number): Promise<void> => {
        if (!isAuthenticated || user?.role !== 'candidat') {
            return;
        }

        setIsCheckingApplication(true);
        try {
            const hasAlreadyApplied = await candidatureService.hasAppliedToJob(jobId);
            setHasApplied(hasAlreadyApplied);
        } catch (error) {
            console.error('Erreur lors de la vérification de candidature:', error);
            setHasApplied(false);
        } finally {
            setIsCheckingApplication(false);
        }
    };

    /**
     * Effet pour vérifier le statut de candidature quand l'offre change
     */
    useEffect(() => {
        if (job && isAuthenticated && user?.role === 'candidat') {
            checkApplicationStatus(job.id);
        } else {
            setHasApplied(false);
        }
    }, [job?.id, isAuthenticated, user?.role]);

    if (!job) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                    <Briefcase className="h-12 w-12 mx-auto opacity-50" />
                    <p className="text-lg">Sélectionnez une offre d'emploi</p>
                    <p className="text-sm">
                        Cliquez sur une offre dans la liste pour voir les détails
                    </p>
                </div>
            </div>
        );
    }

    /**
     * Formate la date de création de l'offre
     * @param date - Date à formater
     * @returns Date formatée
     */
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6">
                {/* En-tête avec image et informations principales */}
                <div className="flex items-start gap-4">
                    <img
                        src={job.image}
                        alt={`Logo ${job.company}`}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{job.company}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default">{job.contract}</Badge>
                            <Badge variant="secondary">{job.work}</Badge>
                            <Badge variant="outline">{job.experience}</Badge>
                        </div>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                    <Button 
                        size="lg" 
                        className="flex-1" 
                        onClick={handleApplyClick}
                        disabled={isCheckingApplication || (isAuthenticated && user?.role === 'candidat' && hasApplied)}
                        variant={hasApplied ? "secondary" : "default"}
                    >
                        {hasApplied ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Candidature envoyée
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                {!isAuthenticated 
                                    ? "Se connecter pour postuler" 
                                    : user?.role !== 'candidat'
                                    ? "Seuls les candidats peuvent postuler"
                                    : "Postuler"
                                }
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="lg">
                        <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="lg">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>

                <Separator />

                {/* Informations détaillées */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{job.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Euro className="h-4 w-4 text-muted-foreground" />
                            <span>{job.salary}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Publié le {formatDate(job.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Temps plein</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Description du poste</h2>
                    <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                    </div>
                </div>

                {/* Compétences */}
                {job.keywords.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Compétences requises</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.keywords.map((keyword) => (
                                    <Badge key={keyword} variant="secondary" className="text-sm">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Separator />

                {/* Informations sur l'entreprise */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">À propos de l'entreprise</h2>
                    <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={job.image}
                                alt={`Logo ${job.company}`}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                                <h3 className="font-semibold">{job.company}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Entreprise technologique
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Nous sommes une entreprise innovante spécialisée dans le développement
                            de solutions technologiques. Nous recherchons des talents passionnés
                            pour rejoindre notre équipe dynamique.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Voir l'entreprise
                        </Button>
                    </div>
                </div>

                {/* Bouton de candidature en bas */}
                <div className="pt-4">
                    <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={handleApplyClick}
                        disabled={isCheckingApplication || (isAuthenticated && user?.role === 'candidat' && hasApplied)}
                        variant={hasApplied ? "secondary" : "default"}
                    >
                        {hasApplied ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Candidature envoyée
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                {!isAuthenticated 
                                    ? "Se connecter pour postuler" 
                                    : user?.role !== 'candidat'
                                    ? "Seuls les candidats peuvent postuler"
                                    : "Postuler à cette offre"
                                }
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Modal de candidature */}
            <ApplicationModal
                job={job}
                isOpen={isApplicationModalOpen}
                onClose={handleCloseApplicationModal}
                onApplicationSubmitted={handleApplicationSubmitted}
            />
        </div>
    );
}
