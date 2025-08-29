import { useState, type JSX } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import type { JobFilters as JobFiltersType } from "@/types/job";

interface JobFiltersProps {
    filters: JobFiltersType;
    onFiltersChange: (filters: JobFiltersType) => void;
}

/**
 * Composant de filtres pour les offres d'emploi
 * @param filters - Filtres actuels
 * @param onFiltersChange - Fonction appelée lors du changement de filtres
 * @returns {JSX.Element}
 */
export default function JobFilters({ filters, onFiltersChange }: JobFiltersProps): JSX.Element {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    /**
     * Met à jour un filtre spécifique
     * @param key - Clé du filtre à mettre à jour
     * @param value - Nouvelle valeur
     */
    const updateFilter = (
        key: keyof JobFiltersType,
        value: JobFiltersType[keyof JobFiltersType],
    ): void => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    /**
     * Remet à zéro tous les filtres
     */
    const resetFilters = (): void => {
        onFiltersChange({
            search: "",
            contract: "all",
            work: "all",
            salaryMin: 0,
            salaryMax: 100000,
            dateRange: "all",
        });
    };

    /**
     * Compte le nombre de filtres actifs
     */
    const activeFiltersCount = (): number => {
        let count = 0;
        if (filters.search) count++;
        if (filters.contract !== "all") count++;
        if (filters.work !== "all") count++;
        if (filters.salaryMin > 0 || filters.salaryMax < 100000) count++;
        if (filters.dateRange !== "all") count++;
        return count;
    };

    const activeCount = activeFiltersCount();

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4 space-y-4">
            {/* Barre de recherche principale */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Rechercher un emploi, entreprise..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Bouton pour étendre/réduire les filtres */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filtres avancés
                    {activeCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                            {activeCount}
                        </span>
                    )}
                </Button>

                {activeCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Effacer
                    </Button>
                )}
            </div>

            {/* Filtres avancés */}
            {isExpanded && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type de contrat */}
                        <div className="space-y-2">
                            <Label>Type de contrat</Label>
                            <Select
                                value={filters.contract}
                                onValueChange={(value) =>
                                    updateFilter("contract", value as JobFiltersType["contract"])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les contrats</SelectItem>
                                    <SelectItem value="CDI">CDI</SelectItem>
                                    <SelectItem value="CDD">CDD</SelectItem>
                                    <SelectItem value="Stage">Stage</SelectItem>
                                    <SelectItem value="Freelance">Freelance</SelectItem>
                                    <SelectItem value="Alternance">Alternance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Mode de travail */}
                        <div className="space-y-2">
                            <Label>Mode de travail</Label>
                            <Select
                                value={filters.work}
                                onValueChange={(value) =>
                                    updateFilter("work", value as JobFiltersType["work"])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les modes</SelectItem>
                                    <SelectItem value="Remote">Remote</SelectItem>
                                    <SelectItem value="Hybride">Hybride</SelectItem>
                                    <SelectItem value="Présentiel">Présentiel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Salaire minimum */}
                        <div className="space-y-2">
                            <Label>Salaire minimum (€)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.salaryMin || ""}
                                onChange={(e) =>
                                    updateFilter("salaryMin", Number(e.target.value) || 0)
                                }
                            />
                        </div>

                        {/* Salaire maximum */}
                        <div className="space-y-2">
                            <Label>Salaire maximum (€)</Label>
                            <Input
                                type="number"
                                placeholder="100000"
                                value={filters.salaryMax === 100000 ? "" : filters.salaryMax}
                                onChange={(e) =>
                                    updateFilter("salaryMax", Number(e.target.value) || 100000)
                                }
                            />
                        </div>
                    </div>

                    {/* Date de publication */}
                    <div className="space-y-2">
                        <Label>Date de publication</Label>
                        <Select
                            value={filters.dateRange}
                            onValueChange={(value) =>
                                updateFilter("dateRange", value as JobFiltersType["dateRange"])
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les dates</SelectItem>
                                <SelectItem value="today">Aujourd'hui</SelectItem>
                                <SelectItem value="week">Cette semaine</SelectItem>
                                <SelectItem value="month">Ce mois-ci</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    );
}
