import SpotlightCard from "../spotlightcard/spotlightcard";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";
import { MapPin, Euro, Briefcase, Clock } from "lucide-react";
import { mockJobs } from "@/data/mockJobs";
import type { Job } from "@/types/job";

export default function Recent() {
    // Récupérer les 6 offres les plus récentes
    const recentOffers: Job[] = mockJobs
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 6);

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

    return (
        <div className="relative min-h-[80vh] w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Offres Récentes</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Découvrez les dernières opportunités d'emploi publiées par nos entreprises
                    partenaires
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
                                {offer.keywords.slice(0, 2).map((keyword) => (
                                    <Badge key={keyword} variant="outline" className="text-xs">
                                        {keyword}
                                    </Badge>
                                ))}
                                {offer.keywords.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{offer.keywords.length - 2}
                                    </Badge>
                                )}
                            </div>

                            {/* Bouton d'action */}
                            <div className="mt-auto">
                                <Button asChild className="w-full">
                                    <Link to="/jobs">Voir l'offre</Link>
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
