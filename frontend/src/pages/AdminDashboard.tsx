import { useState, useEffect, type JSX } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Building2,
  UserCheck,
  Activity
} from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { adminService } from "@/services/adminService"
import type { AdminDashboardData } from "@/types/admin"

/**
 * Dashboard d'administration avec statistiques complètes
 * Accessible uniquement aux administrateurs
 * @returns {JSX.Element}
 */
export default function AdminDashboard(): JSX.Element {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // Vérification des droits d'accès
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Vérifier si l'utilisateur est administrateur
    if (!user?.email || !adminService.checkAdminAccess(user.email)) {
      navigate('/')
      return
    }

    // Charger les données du dashboard
    loadDashboardData()
  }, [isAuthenticated, user, navigate])

  /**
   * Charge les données du dashboard admin
   */
  const loadDashboardData = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const data = await adminService.getDashboardData()
      setDashboardData(data)
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error('Erreur dashboard admin:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Formate un nombre avec des espaces pour les milliers
   * @param num - Nombre à formater
   * @returns Nombre formaté
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR')
  }

  /**
   * Calcule le pourcentage de variation
   * @param current - Valeur actuelle
   * @param previous - Valeur précédente
   * @returns Pourcentage de variation
   */
  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

  if (!isAuthenticated || !user || !adminService.checkAdminAccess(user.email)) {
    return <div>Accès refusé</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || 'Erreur de chargement'}</p>
        </div>
      </div>
    )
  }

  const { stats, userGrowth, applicationStatus, jobsByContract, monthlyActivity, topCompanies } = dashboardData

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Dashboard Administrateur
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble des statistiques de la plateforme
            </p>
          </div>
          <Badge variant="outline" className="text-primary">
            Admin Access
          </Badge>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs totaux</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+12% ce mois</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offres d'emploi</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalJobs)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+8% ce mois</span>
                  </div>
                </div>
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Candidatures</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalApplications)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+15% ce mois</span>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vues totales</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalViews)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+22% ce mois</span>
                  </div>
                </div>
                <Eye className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Candidats</p>
                  <p className="text-xl font-bold">{formatNumber(stats.totalCandidats)}</p>
                </div>
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entreprises</p>
                  <p className="text-xl font-bold">{formatNumber(stats.totalEntreprises)}</p>
                </div>
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offres actives</p>
                  <p className="text-xl font-bold">{formatNumber(stats.activeJobs)}</p>
                </div>
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique de croissance des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Croissance des utilisateurs</CardTitle>
              <CardDescription>Évolution mensuelle des inscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="candidats" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Candidats"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="entreprises" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Entreprises"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Statut des candidatures */}
          <Card>
            <CardHeader>
              <CardTitle>Statut des candidatures</CardTitle>
              <CardDescription>Répartition des candidatures par statut</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={applicationStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activité mensuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Activité mensuelle</CardTitle>
              <CardDescription>Candidatures, offres créées et nouveaux utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" fill="#f59e0b" name="Candidatures" />
                  <Bar dataKey="jobsCreated" fill="#10b981" name="Offres créées" />
                  <Bar dataKey="newUsers" fill="#3b82f6" name="Nouveaux utilisateurs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Offres par type de contrat */}
          <Card>
            <CardHeader>
              <CardTitle>Offres par type de contrat</CardTitle>
              <CardDescription>Répartition des offres d'emploi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobsByContract.map((item) => (
                  <div key={item.contract} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{item.contract}</Badge>
                      <span className="text-sm">{item.count} offres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top entreprises */}
        <Card>
          <CardHeader>
            <CardTitle>Top entreprises</CardTitle>
            <CardDescription>Entreprises les plus actives sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                <div key={company.company} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{company.company}</h4>
                      <p className="text-sm text-muted-foreground">
                        {company.jobsCount} offres publiées
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatNumber(company.applicationsReceived)} candidatures</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(company.averageViews)} vues moyennes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques détaillées des candidatures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Candidatures acceptées</p>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(stats.acceptedApplications)}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.acceptedApplications / stats.totalApplications) * 100)}% du total
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Candidatures refusées</p>
                  <p className="text-2xl font-bold text-red-600">{formatNumber(stats.rejectedApplications)}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.rejectedApplications / stats.totalApplications) * 100)}% du total
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">{formatNumber(stats.pendingApplications)}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.pendingApplications / stats.totalApplications) * 100)}% du total
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
