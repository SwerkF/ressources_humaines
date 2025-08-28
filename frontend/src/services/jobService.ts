import type { Job, JobFilters, JobSearchParams, JobSearchResult } from '@/types/job'
import { mockJobs } from '@/data/mockJobs'

/**
 * Service pour gérer les offres d'emploi
 */
export class JobService {
  private jobs: Job[] = mockJobs

  /**
   * Recherche et filtre les offres d'emploi
   * @param params - Paramètres de recherche et filtres
   * @returns Résultat paginé des offres d'emploi
   */
  searchJobs(params: JobSearchParams): JobSearchResult {
    let filteredJobs = this.filterJobs(this.jobs, params.filters)
    
    // Tri par date de création décroissante
    filteredJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    const total = filteredJobs.length
    const totalPages = Math.ceil(total / params.limit)
    const startIndex = (params.page - 1) * params.limit
    const endIndex = startIndex + params.limit
    
    const jobs = filteredJobs.slice(startIndex, endIndex)
    
    return {
      jobs,
      total,
      totalPages,
      currentPage: params.page
    }
  }

  /**
   * Récupère une offre d'emploi par son ID
   * @param id - ID de l'offre
   * @returns Offre d'emploi ou null si non trouvée
   */
  getJobById(id: number): Job | null {
    return this.jobs.find(job => job.id === id) || null
  }

  /**
   * Filtre les offres selon les critères
   * @param jobs - Liste des offres à filtrer
   * @param filters - Filtres à appliquer
   * @returns Liste filtrée
   */
  private filterJobs(jobs: Job[], filters: JobFilters): Job[] {
    return jobs.filter(job => {
      // Filtre de recherche textuelle
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        
        if (!matchesSearch) return false
      }

      // Filtre type de contrat
      if (filters.contract !== 'all' && job.contract !== filters.contract) {
        return false
      }

      // Filtre mode de travail
      if (filters.work !== 'all' && job.work !== filters.work) {
        return false
      }

      // Filtre salaire (extraction approximative du salaire minimum depuis la chaîne)
      if (filters.salaryMin > 0 || filters.salaryMax < 100000) {
        const salaryMatch = job.salary.match(/(\d+)(?:\s*€|\s*euros?)/i)
        if (salaryMatch) {
          const jobSalaryMin = parseInt(salaryMatch[1])
          if (jobSalaryMin < filters.salaryMin || jobSalaryMin > filters.salaryMax) {
            return false
          }
        }
      }

      // Filtre par date
      if (filters.dateRange !== 'all') {
        const now = new Date()
        const jobDate = job.createdAt
        const diffInDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (filters.dateRange) {
          case 'today':
            if (diffInDays > 0) return false
            break
          case 'week':
            if (diffInDays > 7) return false
            break
          case 'month':
            if (diffInDays > 30) return false
            break
        }
      }

      return true
    })
  }
}

// Instance singleton du service
export const jobService = new JobService()
