import type { AdminDashboardData, AdminStats, UserGrowthData, ApplicationStatusData, JobsByContractData, MonthlyActivityData, TopCompaniesData } from '@/types/admin'

/**
 * Service pour générer des données d'administration simulées
 */
export class AdminService {
  /**
   * Génère des statistiques globales simulées
   */
  private generateStats(): AdminStats {
    return {
      totalUsers: 1247,
      totalCandidats: 892,
      totalEntreprises: 355,
      totalJobs: 156,
      totalApplications: 2834,
      acceptedApplications: 423,
      rejectedApplications: 1156,
      pendingApplications: 1255,
      activeJobs: 134,
      inactiveJobs: 22,
      totalViews: 15678
    }
  }

  /**
   * Génère des données de croissance des utilisateurs
   */
  private generateUserGrowth(): UserGrowthData[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    
    return months.map((month, index) => {
      const candidats = Math.floor(Math.random() * 50) + 20 + index * 5
      const entreprises = Math.floor(Math.random() * 20) + 5 + index * 2
      return {
        month,
        candidats,
        entreprises,
        total: candidats + entreprises
      }
    })
  }

  /**
   * Génère des données de statut des candidatures
   */
  private generateApplicationStatus(): ApplicationStatusData[] {
    return [
      { name: 'En attente', value: 1255, color: '#f59e0b' },
      { name: 'Refusées', value: 1156, color: '#ef4444' },
      { name: 'Acceptées', value: 423, color: '#10b981' }
    ]
  }

  /**
   * Génère des données d'offres par type de contrat
   */
  private generateJobsByContract(): JobsByContractData[] {
    const contracts = [
      { contract: 'CDI', count: 89 },
      { contract: 'CDD', count: 34 },
      { contract: 'Stage', count: 18 },
      { contract: 'Freelance', count: 12 },
      { contract: 'Alternance', count: 3 }
    ]

    const total = contracts.reduce((sum, item) => sum + item.count, 0)
    
    return contracts.map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }))
  }

  /**
   * Génère des données d'activité mensuelle
   */
  private generateMonthlyActivity(): MonthlyActivityData[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']
    
    return months.map((month, index) => ({
      month,
      applications: Math.floor(Math.random() * 200) + 150 + index * 20,
      jobsCreated: Math.floor(Math.random() * 30) + 15 + index * 2,
      newUsers: Math.floor(Math.random() * 80) + 40 + index * 5
    }))
  }

  /**
   * Génère des données des meilleures entreprises
   */
  private generateTopCompanies(): TopCompaniesData[] {
    const companies = [
      'TechCorp', 'StartupXYZ', 'WebAgency Pro', 'DataFlow Solutions', 
      'E-Commerce Plus', 'FormaDev', 'BigTech Corp', 'MobileFirst'
    ]

    return companies.slice(0, 5).map(company => ({
      company,
      jobsCount: Math.floor(Math.random() * 15) + 5,
      applicationsReceived: Math.floor(Math.random() * 200) + 50,
      averageViews: Math.floor(Math.random() * 100) + 80
    })).sort((a, b) => b.applicationsReceived - a.applicationsReceived)
  }

  /**
   * Récupère toutes les données du dashboard admin
   */
  async getDashboardData(): Promise<AdminDashboardData> {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      stats: this.generateStats(),
      userGrowth: this.generateUserGrowth(),
      applicationStatus: this.generateApplicationStatus(),
      jobsByContract: this.generateJobsByContract(),
      monthlyActivity: this.generateMonthlyActivity(),
      topCompanies: this.generateTopCompanies()
    }
  }

  /**
   * Vérifie si un utilisateur a les droits d'administration
   */
  checkAdminAccess(userEmail: string): boolean {
    // Liste des emails administrateurs (en production, cela viendrait d'une API)
    const adminEmails = [
      'admin@traverselarue.fr',
      'superadmin@traverselarue.fr',
      'demo@traverselarue.fr' // Pour les tests
    ]

    return adminEmails.includes(userEmail)
  }
}

// Instance singleton du service
export const adminService = new AdminService()
