import { useState, useEffect, type JSX } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus,
  Eye,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  MapPin,
  Euro,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { mockJobs } from "@/data/mockJobs"
import type { CompanyJob, CompanyDashboardStats, JobCreationData } from "@/types/company"
import type { Job } from "@/types/job"
import CreateJobModal from "@/components/jobs/CreateJobModal"

/**
 * Dashboard entreprise pour gérer les offres d'emploi
 * @returns {JSX.Element}
 */
export default function CompanyDashboard(): JSX.Element {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [companyJobs, setCompanyJobs] = useState<CompanyJob[]>([])
  const [stats, setStats] = useState<CompanyDashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalViews: 0
  })
  const [selectedJob, setSelectedJob] = useState<CompanyJob | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  // Redirection si non authentifié ou pas entreprise
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user?.userType !== 'entreprise') {
      navigate('/')
      return
    }

    // Simuler les offres de l'entreprise (filtrer par entreprise connectée)
    const enterpriseJobs: CompanyJob[] = mockJobs
      .filter(job => job.company === user.nomEntreprise)
      .map(job => ({
        ...job,
        isActive: Math.random() > 0.2, // 80% des offres sont actives
        applicationsCount: Math.floor(Math.random() * 25) + 1,
        viewsCount: Math.floor(Math.random() * 200) + 50,
        applications: [] // Sera rempli plus tard
      }))

    setCompanyJobs(enterpriseJobs)

    // Calculer les statistiques
    const totalApplications = enterpriseJobs.reduce((sum, job) => sum + job.applicationsCount, 0)
    const totalViews = enterpriseJobs.reduce((sum, job) => sum + job.viewsCount, 0)
    
    setStats({
      totalJobs: enterpriseJobs.length,
      activeJobs: enterpriseJobs.filter(job => job.isActive).length,
      totalApplications,
      pendingApplications: Math.floor(totalApplications * 0.7), // 70% en attente
      totalViews
    })
  }, [isAuthenticated, user, navigate])

  /**
   * Formate la date de création
   * @param date - Date à formater
   * @returns Date formatée
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  /**
   * Gère la sélection d'une offre pour voir les candidatures
   * @param job - Offre sélectionnée
   */
  const handleJobSelect = (job: CompanyJob): void => {
    setSelectedJob(job)
  }

  /**
   * Ouvre la modal de création d'offre
   */
  const handleCreateJob = (): void => {
    setIsCreateModalOpen(true)
  }

  /**
   * Ferme la modal de création d'offre
   */
  const handleCloseCreateModal = (): void => {
    setIsCreateModalOpen(false)
  }

  /**
   * Gère la création d'une nouvelle offre
   * @param jobData - Données de la nouvelle offre
   */
  const handleJobCreated = (jobData: JobCreationData): void => {
    // Créer une nouvelle offre avec les données fournies
    const newJob: CompanyJob = {
      id: Date.now(), // ID temporaire
      title: jobData.title,
      description: jobData.description,
      image: user?.image || "https://placehold.co/400",
      company: user?.nomEntreprise || "Entreprise",
      salary: jobData.salary,
      contract: jobData.contract,
      location: jobData.location,
      work: jobData.work,
      experience: jobData.experience,
      keywords: jobData.keywords,
      createdAt: new Date(),
      isActive: true,
      applicationsCount: 0,
      viewsCount: 0,
      applications: []
    }

    // Ajouter la nouvelle offre à la liste
    setCompanyJobs(prev => [newJob, ...prev])

    // Mettre à jour les statistiques
    setStats(prev => ({
      ...prev,
      totalJobs: prev.totalJobs + 1,
      activeJobs: prev.activeJobs + 1
    }))

    console.log('Nouvelle offre créée:', newJob)
  }

  /**
   * Gère l'édition d'une offre
   * @param job - Offre à éditer
   */
  const handleEditJob = (job: CompanyJob): void => {
    // TODO: Implémenter l'édition d'offre
    console.log('Éditer l\'offre:', job.title)
  }

  /**
   * Gère la suppression d'une offre
   * @param job - Offre à supprimer
   */
  const handleDeleteJob = (job: CompanyJob): void => {
    // TODO: Implémenter la suppression d'offre
    console.log('Supprimer l\'offre:', job.title)
  }

  if (!isAuthenticated || user?.userType !== 'entreprise') {
    return <div>Chargement...</div>
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
          <Button onClick={handleCreateJob} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Créer une offre
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offres totales</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Offres actives</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Candidatures</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingApplications}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vues totales</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
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
                {companyJobs.length} offre{companyJobs.length > 1 ? 's' : ''}
              </p>
            </div>

            {companyJobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucune offre d'emploi</h3>
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
                      selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleJobSelect(job)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge variant={job.isActive ? "default" : "secondary"}>
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              <span>{job.salary}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Publié le {formatDate(job.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{job.applicationsCount} candidature{job.applicationsCount > 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{job.viewsCount} vues</span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">{job.contract}</Badge>
                              <Badge variant="outline">{job.work}</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditJob(job)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteJob(job)
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
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Candidatures</CardTitle>
                <CardDescription>
                  {selectedJob 
                    ? `${selectedJob.applicationsCount} candidature${selectedJob.applicationsCount > 1 ? 's' : ''} pour "${selectedJob.title}"`
                    : 'Sélectionnez une offre pour voir les candidatures'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedJob ? (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Fonctionnalité de gestion des candidatures à venir
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Sélectionnez une offre dans la liste pour voir les candidatures reçues
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
  )
}
