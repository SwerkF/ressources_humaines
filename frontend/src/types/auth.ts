/** 
 * Types pour l'authentification et les profils utilisateur
 */

export type UserType = 'candidat' | 'entreprise'

export interface BaseUser {
  id: string
  email: string
  userType: UserType
  createdAt: Date
}

export interface Candidat extends BaseUser {
  userType: 'candidat'
  prenom: string
  nom: string
  dateNaissance: string
  posteActuel: string
  entrepriseActuelle: string
  linkedin?: string
}

export interface Entreprise extends BaseUser {
  userType: 'entreprise'
  nomEntreprise: string
  siret: string
  nomGerant: string
  localisation: string
  image?: string
  linkedin?: string
  siteWeb?: string
}

export type User = Candidat | Entreprise

export interface RegisterCandidatData {
  prenom: string
  nom: string
  email: string
  password: string
  dateNaissance: string
  posteActuel: string
  entrepriseActuelle: string
  linkedin?: string
}

export interface RegisterEntrepriseData {
  nomEntreprise: string
  siret: string
  nomGerant: string
  email: string
  password: string
  localisation: string
  image?: string
  linkedin?: string
  siteWeb?: string
}

export interface LoginData {
  email: string
  password: string
}
