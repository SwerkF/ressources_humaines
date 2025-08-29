import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download, Eye } from "lucide-react";
import type { CandidatureAPI } from "@/services/candidatureService";

interface CandidatureCardProps {
    candidature: CandidatureAPI;
    onStatusChange?: (candidatureId: number, newStatus: 'en_attente' | 'acceptee' | 'refusee') => void;
    isStatusChanging?: boolean;
}

/**
 * Composant pour afficher une candidature individuelle
 */
export default function CandidatureCard({ 
    candidature, 
    onStatusChange,
    isStatusChanging = false 
}: CandidatureCardProps) {
    /**
     * Formate la date de candidature
     */
    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    /**
     * Ouvre un fichier dans un nouvel onglet
     */
    const openFile = (filePath: string): void => {
        const fullUrl = filePath.startsWith('http') 
            ? filePath 
            : `http://localhost:8000${filePath}`;
        window.open(fullUrl, '_blank');
    };

    /**
     * Obtient la couleur du badge selon le statut
     */
    const getStatusBadgeVariant = (statut: string) => {
        switch (statut) {
            case 'acceptee':
                return 'default'; // vert
            case 'refusee':
                return 'destructive'; // rouge
            case 'en_attente':
            default:
                return 'secondary'; // gris
        }
    };

    /**
     * Obtient le texte du statut
     */
    const getStatusText = (statut: string): string => {
        switch (statut) {
            case 'en_attente':
                return 'En attente';
            case 'acceptee':
                return 'Acceptée';
            case 'refusee':
                return 'Refusée';
            default:
                return 'Inconnu';
        }
    };

    return (
        <Card className="p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <div className="space-y-3">
                {/* Header avec nom et statut */}
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-lg">
                            {candidature.candidat_nom}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {candidature.candidat_email}
                        </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(candidature.statut)}>
                        {getStatusText(candidature.statut)}
                    </Badge>
                </div>

                {/* Date de candidature */}
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Candidaté le {formatDate(candidature.date_candidature)}
                </p>

                {/* Message de motivation */}
                {candidature.message && (
                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Message du candidat :
                        </p>
                        <p className="text-sm italic text-gray-600">
                            "{candidature.message}"
                        </p>
                    </div>
                )}

                {/* Boutons d'actions pour les fichiers */}
                <div className="flex flex-wrap gap-2">
                    {candidature.cv && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openFile(candidature.cv)}
                            className="flex items-center gap-1"
                        >
                            <Eye className="h-3 w-3" />
                            Voir CV
                        </Button>
                    )}
                    
                    {candidature.lettre_motivation && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openFile(candidature.lettre_motivation)}
                            className="flex items-center gap-1"
                        >
                            <Eye className="h-3 w-3" />
                            Voir Lettre
                        </Button>
                    )}
                </div>

                {/* Actions de modification du statut (si callback fourni) */}
                {onStatusChange && candidature.statut === 'en_attente' && (
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => onStatusChange(candidature.id, 'acceptee')}
                            disabled={isStatusChanging}
                            className="flex-1"
                        >
                            Accepter
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onStatusChange(candidature.id, 'refusee')}
                            disabled={isStatusChanging}
                            className="flex-1"
                        >
                            Refuser
                        </Button>
                    </div>
                )}

                {/* Info si déjà traitée */}
                {candidature.statut !== 'en_attente' && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                        Candidature {candidature.statut === 'acceptee' ? 'acceptée' : 'refusée'}
                        {candidature.date_reponse && ` le ${formatDate(candidature.date_reponse)}`}
                    </p>
                )}
            </div>
        </Card>
    );
}