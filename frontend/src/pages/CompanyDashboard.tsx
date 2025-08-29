import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Users,
    Briefcase,
    TrendingUp,
    Calendar,
    MapPin,
    Euro,
    Edit,
    Trash2,
    Loader2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { companyService, type CompanyJobAPI, type DashboardStats } from "@/services/companyService";
import { candidatureService, type CandidatureAPI } from "@/services/candidatureService";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import CandidatureCard from "@/components/candidatures/CandidatureCard";

/**
 * Dashboard entreprise pour gérer les offres d'emploi
 * @returns {JSX.Element}
 */
export default function CompanyDashboard(): JSX.Element {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [companyJobs, setCompanyJobs] = useState<CompanyJobAPI[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
    });
    const [selectedJob, setSelectedJob] = useState<CompanyJobAPI | null>(null);
    const [selectedJobCandidatures, setSelectedJobCandidatures] = useState<CandidatureAPI[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingCandidatures, setIsLoadingCandidatures] = useState<boolean>(false);
    const [isChangingCandidatureStatus, setIsChangingCandidatureStatus] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Charge les données du dashboard
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user?.role !== "recruteur") {
            navigate("/");
            return;
        }

        loadDashboardData();
    }, [isAuthenticated, user, navigate]);

    /**
     * Charge les données du dashboard depuis l'API
     */
    const loadDashboardData = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Charger les jobs et les stats en parallèle
            const [jobs, dashboardStats] = await Promise.all([
                companyService.getMyJobs(),
                companyService.getDashboardStats()
            ]);
            
            setCompanyJobs(jobs);
            setStats(dashboardStats);
        } catch (error: any) {
            console.error('Erreur chargement dashboard:', error);
            setError(error.message || 'Erreur lors du chargement du dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Formate la date de création
     * @param date - Date à formater
     * @returns Date formatée
     */
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    /**
     * Gère la sélection d'une offre pour voir les candidatures
     * @param job - Offre sélectionnée
     */
    const handleJobSelect = async (job: CompanyJobAPI): Promise<void> => {
        setSelectedJob(job);
        setSelectedJobCandidatures([]);
        
        if (job.nombre_candidatures > 0) {
            setIsLoadingCandidatures(true);
            try {
                const candidatures = await companyService.getJobCandidatures(job.id);
                setSelectedJobCandidatures(candidatures);
            } catch (error: any) {
                console.error('Erreur chargement candidatures:', error);
                // Ne pas afficher d'erreur critique, juste un log
            } finally {
                setIsLoadingCandidatures(false);
            }
        }
    };

    /**
     * Ouvre la modal de création d'offre
     */
    const handleCreateJob = (): void => {
        setIsCreateModalOpen(true);
    };

    /**
     * Ferme la modal de création d'offre
     */
    const handleCloseCreateModal = (): void => {
        setIsCreateModalOpen(false);
    };

    /**
     * Gère la création d'une nouvelle offre
     * Recharge les données après création réussie
     */
    const handleJobCreated = async (): Promise<void> => {
        try {
            // Fermer la modal
            setIsCreateModalOpen(false);
            
            // Recharger toutes les données du dashboard
            await loadDashboardData();
        } catch (error: any) {
            console.error('Erreur rechargement après création:', error);
            setError('Erreur lors de la mise à jour des données');
        }
    };

    /**
     * Gère l'édition d'une offre
     * @param job - Offre à éditer
     */
    const handleEditJob = (job: CompanyJobAPI): void => {
        // TODO: Implémenter l'édition d'offre avec modal
        console.log("Éditer l'offre:", job.titre);
    };

    /**
     * Gère la suppression d'une offre
     * @param job - Offre à supprimer
     */
    const handleDeleteJob = async (job: CompanyJobAPI): Promise<void> => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${job.titre}" ?`)) {
            return;
        }
        
        try {
            await companyService.deleteJob(job.id);
            
            // Retirer de la liste
            setCompanyJobs((prev) => prev.filter(j => j.id !== job.id));
            
            // Si c'était l'offre sélectionnée, la désélectionner
            if (selectedJob?.id === job.id) {
                setSelectedJob(null);
                setSelectedJobCandidatures([]);
            }
            
            // Recharger les stats
            const updatedStats = await companyService.getDashboardStats();
            setStats(updatedStats);
            
        } catch (error: any) {
            console.error('Erreur suppression offre:', error);
            setError(error.message || 'Erreur lors de la suppression de l\'offre');
        }
    };

    /**
     * Gère le changement de statut actif/inactif d'une offre
     * @param job - Offre à modifier
     */
    const handleToggleJobStatus = async (job: CompanyJobAPI): Promise<void> => {
        try {
            const updatedJob = await companyService.toggleJobStatus(job.id, !job.active);
            
            // Mettre à jour dans la liste
            setCompanyJobs((prev) => 
                prev.map(j => j.id === job.id ? updatedJob : j)
            );
            
            // Recharger les stats
            const updatedStats = await companyService.getDashboardStats();
            setStats(updatedStats);
            
        } catch (error: any) {
            console.error('Erreur changement statut:', error);
            setError(error.message || 'Erreur lors du changement de statut');
        }
    };

    /**
     * Gère le changement de statut d'une candidature
     * @param candidatureId - ID de la candidature
     * @param newStatus - Nouveau statut
     */
    const handleCandidatureStatusChange = async (
        candidatureId: number, 
        newStatus: 'en_attente' | 'acceptee' | 'refusee'
    ): Promise<void> => {
        setIsChangingCandidatureStatus(true);
        try {
            await candidatureService.updateCandidatureStatus(candidatureId, newStatus);
            
            // Mettre à jour la liste des candidatures
            setSelectedJobCandidatures(prev => 
                prev.map(c => 
                    c.id === candidatureId 
                        ? { ...c, statut: newStatus, date_reponse: new Date().toISOString() }
                        : c
                )
            );
            
            // Recharger les stats du dashboard
            const updatedStats = await companyService.getDashboardStats();
            setStats(updatedStats);
            
        } catch (error: any) {
            console.error('Erreur changement statut candidature:', error);
            setError(error.message || 'Erreur lors du changement de statut de la candidature');
        } finally {
            setIsChangingCandidatureStatus(false);
        }
    };

    if (!isAuthenticated || user?.role !== "recruteur") {
        return <div>Chargement...</div>;
    }

    // État de chargement initial
    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Entreprise</h1>
                        <p className="text-muted-foreground">
                            Gérez vos offres d'emploi et suivez vos candidatures
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={loadDashboardData}
                            variant="outline"
                            size="lg"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                        <Button onClick={handleCreateJob} size="lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Créer une offre
                        </Button>
                    </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setError(null)}
                                    className="ml-auto"
                                >
                                    ×
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Offres totales
                                    </p>
                                    <p className="text-2xl font-bold">{stats.totalJobs}</p>
                                </div>
                                <Briefcase className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Offres actives
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.activeJobs}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Candidatures
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats.totalApplications}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        En attente
                                    </p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {stats.pendingApplications}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Acceptées
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.acceptedApplications}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Refusées
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {stats.rejectedApplications}
                                    </p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Liste des offres */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Mes offres d'emploi</h2>
                            <p className="text-sm text-muted-foreground">
                                {companyJobs.length} offre{companyJobs.length > 1 ? "s" : ""}
                            </p>
                        </div>

                        {companyJobs.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        Aucune offre d'emploi
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Commencez par créer votre première offre d'emploi
                                    </p>
                                    <Button onClick={handleCreateJob}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer une offre
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {companyJobs.map((job) => (
                                    <Card
                                        key={job.id}
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            selectedJob?.id === job.id ? "ring-2 ring-primary" : ""
                                        }`}
                                        onClick={() => handleJobSelect(job)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {job.titre}
                                                        </h3>
                                                        <Badge
                                                            variant={job.active ? "default" : "secondary"}
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleJobStatus(job);
                                                            }}
                                                        >
                                                            {job.active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{job.localisation}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Euro className="h-3 w-3" />
                                                            <span>
                                                                {companyService.formatSalary(job.salaire_min, job.salaire_max)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                Publié le{" "}
                                                                {formatDate(new Date(job.date_creation))}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            <span>
                                                                {job.nombre_candidatures} candidature
                                                                {job.nombre_candidatures > 1 ? "s" : ""}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline">
                                                                {job.type_contrat}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                Expire le {formatDate(new Date(job.date_expiration))}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditJob(job);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteJob(job);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Panneau de détails / candidatures */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4 max-h-[600px] overflow-hidden flex flex-col">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle>Candidatures</CardTitle>
                                <CardDescription>
                                    {selectedJob
                                        ? `${selectedJob.nombre_candidatures} candidature${selectedJob.nombre_candidatures > 1 ? "s" : ""} pour "${selectedJob.titre}"`
                                        : "Sélectionnez une offre pour voir les candidatures"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                {selectedJob ? (
                                    <div className="space-y-4">
                                        {isLoadingCandidatures ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                                <p className="text-muted-foreground">
                                                    Chargement des candidatures...
                                                </p>
                                            </div>
                                        ) : selectedJobCandidatures.length > 0 ? (
                                            selectedJobCandidatures.map((candidature) => (
                                                <CandidatureCard
                                                    key={candidature.id}
                                                    candidature={candidature}
                                                    onStatusChange={handleCandidatureStatusChange}
                                                    isStatusChanging={isChangingCandidatureStatus}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    Aucune candidature pour cette offre
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            Sélectionnez une offre dans la liste pour voir les
                                            candidatures reçues
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Modal de création d'offre */}
                <CreateJobModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    onJobCreated={handleJobCreated}
                />
            </div>
        </div>
    );
}
