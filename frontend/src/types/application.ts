/**
 * Types pour les candidatures
 */

export interface JobApplication {
  id: string
  jobId: number
  candidatId: string
  status: ApplicationStatus
  appliedAt: Date
  coverLetter?: string
  cvFile?: File | string
  candidatInfo: ApplicationCandidatInfo
}

export type ApplicationStatus = 
  | 'pending'     // En attente
  | 'reviewing'   // En cours d'examen
  | 'accepted'    // Acceptée
  | 'rejected'    // Refusée
  | 'withdrawn'   // Retirée

export interface ApplicationCandidatInfo {
  prenom: string
  nom: string
  email: string
  telephone?: string
  posteActuel: string
  entrepriseActuelle: string
  linkedin?: string
}

export interface ApplicationFormData {
  coverLetter: string
  cvFile: File | null
  candidatInfo: ApplicationCandidatInfo
  acceptTerms: boolean
}

export interface ApplicationSubmissionResult {
  success: boolean
  applicationId?: string
  message: string
}
