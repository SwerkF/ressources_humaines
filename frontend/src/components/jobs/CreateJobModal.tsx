import { useState, type JSX } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  X, 
  Briefcase, 
  MapPin, 
  Euro, 
  Clock,
  Users,
  Save,
  Loader2
} from "lucide-react"
import { useAuthStore } from "@/store/auth"
import type { JobCreationData } from "@/types/company"
import type { ContractType, WorkType } from "@/types/job"

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
  onJobCreated?: (job: JobCreationData) => void
}

/**
 * Modal de création d'une nouvelle offre d'emploi
 * @param isOpen - État d'ouverture de la modal
 * @param onClose - Fonction appelée pour fermer la modal
 * @param onJobCreated - Fonction appelée après création réussie
 * @returns {JSX.Element}
 */
export default function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps): JSX.Element {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [newKeyword, setNewKeyword] = useState<string>('')

  const [formData, setFormData] = useState<JobCreationData>({
    title: '',
    description: '',
    salary: '',
    contract: 'CDI',
    location: '',
    work: 'Hybride',
    experience: '',
    keywords: []
  })

  /**
   * Met à jour un champ du formulaire
   * @param field - Champ à mettre à jour
   * @param value - Nouvelle valeur
   */
  const updateFormData = (field: keyof JobCreationData, value: string | string[]): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  /**
   * Ajoute une compétence à la liste
   */
  const addKeyword = (): void => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      updateFormData('keywords', [...formData.keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  /**
   * Supprime une compétence de la liste
   * @param keywordToRemove - Compétence à supprimer
   */
  const removeKeyword = (keywordToRemove: string): void => {
    updateFormData('keywords', formData.keywords.filter(k => k !== keywordToRemove))
  }

  /**
   * Gère l'ajout de compétence avec la touche Entrée
   * @param e - Événement clavier
   */
  const handleKeywordKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  /**
   * Valide le formulaire avant soumission
   */
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre du poste est obligatoire')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('La description du poste est obligatoire')
      return false
    }
    
    if (!formData.salary.trim()) {
      setError('Le salaire est obligatoire')
      return false
    }
    
    if (!formData.location.trim()) {
      setError('La localisation est obligatoire')
      return false
    }
    
    if (!formData.experience.trim()) {
      setError('Le niveau d\'expérience est obligatoire')
      return false
    }
    
    if (formData.keywords.length === 0) {
      setError('Veuillez ajouter au moins une compétence requise')
      return false
    }
    
    return true
  }

  /**
   * Soumet le formulaire de création d'offre
   */
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Appeler la fonction de callback si fournie
      if (onJobCreated) {
        onJobCreated(formData)
      }
      
      // Fermer la modal et réinitialiser
      handleClose()
      
    } catch (err) {
      setError('Une erreur est survenue lors de la création de l\'offre')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Ferme la modal et remet à zéro le formulaire
   */
  const handleClose = (): void => {
    setFormData({
      title: '',
      description: '',
      salary: '',
      contract: 'CDI',
      location: '',
      work: 'Hybride',
      experience: '',
      keywords: []
    })
    setNewKeyword('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Créer une nouvelle offre d'emploi
          </DialogTitle>
          <DialogDescription>
            Publiez une nouvelle offre d'emploi pour {user?.userType === 'entreprise' ? user.nomEntreprise : 'votre entreprise'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message d'erreur */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Informations principales */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du poste *</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ex: Développeur Frontend React"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description du poste *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Décrivez les missions, responsabilités et profil recherché..."
                className="min-h-[120px]"
              />
            </div>
          </div>

          <Separator />

          {/* Détails du poste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salaire *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => updateFormData('salary', e.target.value)}
                  placeholder="Ex: 45000€ - 65000€"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="Ex: Paris, France"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract">Type de contrat *</Label>
              <Select
                value={formData.contract}
                onValueChange={(value) => updateFormData('contract', value as ContractType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Alternance">Alternance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work">Mode de travail *</Label>
              <Select
                value={formData.work}
                onValueChange={(value) => updateFormData('work', value as WorkType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybride">Hybride</SelectItem>
                  <SelectItem value="Présentiel">Présentiel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Niveau d'expérience *</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => updateFormData('experience', e.target.value)}
                placeholder="Ex: 3-5 ans, Débutant, 5+ ans"
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          {/* Compétences requises */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="keywords">Compétences requises *</Label>
              <p className="text-sm text-muted-foreground">
                Ajoutez les technologies, outils et compétences nécessaires pour ce poste
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                id="keywords"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Ex: React, TypeScript, Node.js..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Liste des compétences ajoutées */}
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Aperçu */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Aperçu de l'offre
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Poste :</strong> {formData.title || 'Titre du poste'}</div>
              <div><strong>Entreprise :</strong> {user?.userType === 'entreprise' ? user.nomEntreprise : 'Votre entreprise'}</div>
              <div><strong>Localisation :</strong> {formData.location || 'Non spécifiée'}</div>
              <div><strong>Salaire :</strong> {formData.salary || 'Non spécifié'}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{formData.contract}</Badge>
                <Badge variant="outline">{formData.work}</Badge>
                {formData.experience && <Badge variant="outline">{formData.experience}</Badge>}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Créer l'offre
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
