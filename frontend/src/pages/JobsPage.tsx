import { useState, useEffect, type JSX } from "react";
import JobFilters from "@/components/jobs/JobFilters";
import JobCard from "@/components/jobs/JobCard";
import JobDetail from "@/components/jobs/JobDetail";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { jobService } from "@/services/jobService";
import type { Job, JobFilters as JobFiltersType, JobSearchResult } from "@/types/job";

/**
 * Page principale des offres d'emploi
 * Layout split avec liste à gauche et détails à droite
 * @returns {JSX.Element}
 */
export default function JobsPage(): JSX.Element {
    const [filters, setFilters] = useState<JobFiltersType>({
        search: "",
        contract: "all",
        work: "all",
        salaryMin: 0,
        salaryMax: 100000,
        dateRange: "all",
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [searchResult, setSearchResult] = useState<JobSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const JOBS_PER_PAGE = 10;

    /**
     * Effectue la recherche avec les filtres actuels
     */
    const performSearch = async (): Promise<void> => {
        setIsLoading(true);

        // Simulation d'un délai d'API
        await new Promise((resolve) => setTimeout(resolve, 300));

        const result = jobService.searchJobs({
            page: currentPage,
            limit: JOBS_PER_PAGE,
            filters,
        });

        setSearchResult(result);

        // Si une offre était sélectionnée mais n'est plus dans les résultats, la désélectionner
        if (selectedJob && !result.jobs.find((job) => job.id === selectedJob.id)) {
            setSelectedJob(null);
        }

        setIsLoading(false);
    };

    /**
     * Gère le changement de filtres
     * @param newFilters - Nouveaux filtres
     */
    const handleFiltersChange = (newFilters: JobFiltersType): void => {
        setFilters(newFilters);
        setCurrentPage(1); // Retour à la première page lors d'un changement de filtre
    };

    /**
     * Gère le changement de page
     * @param page - Numéro de la nouvelle page
     */
    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        setSelectedJob(null); // Désélectionner l'offre lors du changement de page
    };

    /**
     * Gère la sélection d'une offre d'emploi
     * @param job - Offre sélectionnée
     */
    const handleJobSelect = (job: Job): void => {
        setSelectedJob(job);
    };

    /**
     * Génère les numéros de pages à afficher dans la pagination
     */
    const generatePageNumbers = (): (number | "ellipsis")[] => {
        if (!searchResult) return [];

        const { totalPages, currentPage } = searchResult;
        const pages: (number | "ellipsis")[] = [];

        // Toujours afficher la première page
        pages.push(1);

        if (totalPages <= 7) {
            // Si peu de pages, afficher toutes
            for (let i = 2; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logique pour les ellipses
            if (currentPage <= 4) {
                for (let i = 2; i <= 5; i++) pages.push(i);
                pages.push("ellipsis");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push("ellipsis");
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push("ellipsis");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push("ellipsis");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Effet pour déclencher la recherche lors des changements
    useEffect(() => {
        performSearch();
    }, [filters, currentPage]);

    // Sélectionner automatiquement la première offre lors du changement de résultats
    useEffect(() => {
        if (searchResult?.jobs.length && !selectedJob) {
            setSelectedJob(searchResult.jobs[0]);
        }
    }, [searchResult, selectedJob]);

    return (
        <div className="h-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <div className="container mx-auto px-4 py-6 h-full flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Offres d'emploi</h1>
                    <p className="text-muted-foreground">
                        {searchResult
                            ? `${searchResult.total} offre${searchResult.total > 1 ? "s" : ""} disponible${searchResult.total > 1 ? "s" : ""}`
                            : "Chargement..."}
                    </p>
                </div>

                {/* Filtres */}
                <div className="mb-6 flex-shrink-0">
                    <JobFilters filters={filters} onFiltersChange={handleFiltersChange} />
                </div>

                {/* Layout principal */}
                <div className="grid lg:grid-cols-5 gap-6 flex-1 min-h-0">
                    {/* Colonne de gauche - Liste des offres */}
                    <div className="lg:col-span-2 flex flex-col min-h-0">
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                            ) : searchResult?.jobs.length ? (
                                searchResult.jobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        isSelected={selectedJob?.id === job.id}
                                        onClick={() => handleJobSelect(job)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Aucune offre d'emploi trouvée</p>
                                    <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {searchResult && searchResult.totalPages > 1 && (
                            <div className="pt-4 flex-shrink-0">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() =>
                                                    currentPage > 1 &&
                                                    handlePageChange(currentPage - 1)
                                                }
                                                className={
                                                    currentPage <= 1
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>

                                        {generatePageNumbers().map((page, index) => (
                                            <PaginationItem key={index}>
                                                {page === "ellipsis" ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(page)}
                                                        isActive={currentPage === page}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() =>
                                                    currentPage < searchResult.totalPages &&
                                                    handlePageChange(currentPage + 1)
                                                }
                                                className={
                                                    currentPage >= searchResult.totalPages
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>

                    {/* Colonne de droite - Détails de l'offre */}
                    <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-lg border">
                        <JobDetail job={selectedJob} />
                    </div>
                </div>
            </div>
        </div>
    );
}
