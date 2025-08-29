import { useState, useEffect } from "react";
import SpotlightCard from "../spotlightcard/spotlightcard";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";
import { MapPin, Euro, Briefcase, Clock, Loader2, AlertCircle } from "lucide-react";
import { jobService } from "@/services/jobService";
import type { Job } from "@/types/job";

export default function Recent() {
    const [recentOffers, setRecentOffers] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les offres récentes depuis l'API
    useEffect(() => {
        const loadRecentOffers = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Récupérer les offres récentes (page 1, 6 résultats)
                const result = await jobService.searchJobs({
                    page: 1,
                    limit: 6,
                    filters: {
                        search: "",
                        contract: "all",
                        work: "all",
                        salaryMin: 0,
                        salaryMax: 100000,
                        dateRange: "all"
                    }
                });

                // Les offres sont déjà triées par date de création décroissante côté API
                setRecentOffers(result.jobs);
            } catch (err: any) {
                console.error('Erreur chargement offres récentes:', err);
                setError('Erreur lors du chargement des offres récentes');
            } finally {
                setIsLoading(false);
            }
        };

        loadRecentOffers();
    }, []);

    /**
     * Tronque un texte à la longueur maximale spécifiée
     * @param text - Texte à tronquer
     * @param maxLength - Longueur maximale
     * @returns Texte tronqué avec "..." si nécessaire
     */
    const truncate = (text: string, maxLength: number): string => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    /**
     * Génère une couleur aléatoire pour le spotlight
     * @returns Couleur RGBA aléatoire
     */
    const randomColor = (): `rgba(${number}, ${number}, ${number}, ${number})` => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
    };

    /**
     * Formate la date de publication de l'offre
     * @param date - Date à formater
     * @returns Date formatée en français
     */
    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Aujourd'hui";
        if (diffInDays === 1) return "Hier";
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
        });
    };

    // État de chargement
    if (isLoading) {
        return (
            <div className="relative min-h-[80vh] w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Offres Récentes</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Découvrez les dernières opportunités d'emploi publiées par nos entreprises partenaires
                    </p>
                </div>
                
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Chargement des offres récentes...</p>
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div className="relative min-h-[80vh] w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Offres Récentes</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Découvrez les dernières opportunités d'emploi publiées par nos entreprises partenaires
                    </p>
                </div>
                
                <div className="flex flex-col items-center justify-center py-16">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-destructive mb-4">{error}</p>
                    <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline"
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    // État vide
    if (recentOffers.length === 0) {
        return (
            <div className="relative min-h-[80vh] w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Offres Récentes</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Découvrez les dernières opportunités d'emploi publiées par nos entreprises partenaires
                    </p>
                </div>
                
                <div className="flex flex-col items-center justify-center py-16">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Aucune offre d'emploi disponible pour le moment</p>
                    <Button asChild variant="outline">
                        <Link to="/jobs">Explorer toutes les offres</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[80vh] w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Offres Récentes</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Découvrez les dernières opportunités d'emploi publiées par nos entreprises partenaires
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {recentOffers.map((offer) => (
                    <div key={offer.id} className="flex flex-col justify-stretch">
                        <SpotlightCard className="h-full p-6" spotlightColor={randomColor()}>
                            {/* En-tête avec logo et entreprise */}
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={offer.image}
                                    alt={`Logo ${offer.company}`}
                                    className="h-12 w-12 rounded-lg object-cover"
                                    onError={(e) => {
                                        // Fallback en cas d'erreur d'image
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.company)}&size=48&background=random`;
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-lg">{offer.company}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(offer.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Titre et description */}
                            <div className="mb-4">
                                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                    {offer.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {truncate(offer.description, 120)}
                                </p>
                            </div>

                            {/* Informations clés */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{offer.location}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Euro className="h-4 w-4 text-muted-foreground" />
                                    <span>{offer.salary}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span>{offer.experience}</span>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge variant="secondary">{offer.contract}</Badge>
                                <Badge variant="outline">{offer.work}</Badge>
                                {offer.keywords && offer.keywords.slice(0, 2).map((keyword) => (
                                    <Badge key={keyword} variant="outline" className="text-xs">
                                        {keyword}
                                    </Badge>
                                ))}
                                {offer.keywords && offer.keywords.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{offer.keywords.length - 2}
                                    </Badge>
                                )}
                            </div>

                            {/* Bouton d'action */}
                            <div className="mt-auto">
                                <Button asChild className="w-full">
                                    <Link to={`/jobs?selected=${offer.id}`}>Voir l'offre</Link>
                                </Button>
                            </div>
                        </SpotlightCard>
                    </div>
                ))}
            </div>

            {/* Bouton vers toutes les offres */}
            <div className="mt-12 text-center">
                <Button asChild variant="outline" size="lg">
                    <Link to="/jobs">Voir toutes les offres d'emploi</Link>
                </Button>
            </div>
        </div>
    );
}
