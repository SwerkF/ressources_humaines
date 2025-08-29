import { useState, type JSX } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import type { RegisterCandidatData } from "@/types/auth"

interface CandidatRegisterFormProps {
  onBack: () => void
}

/**
 * Formulaire d'inscription pour les candidats
 * @param onBack - Fonction appelée pour revenir à la sélection
 * @returns {JSX.Element}
 */
export default function CandidatRegisterForm({ onBack }: CandidatRegisterFormProps): JSX.Element {
  const { registerCandidat, isLoading } = useAuthStore()
  const [formData, setFormData] = useState<RegisterCandidatData>({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    dateNaissance: '',
    posteActuel: '',
    entrepriseActuelle: '',
    linkedin: ''
  })
  const [error, setError] = useState<string>('')

  /**
   * Gère les changements dans les champs du formulaire
   * @param field - Nom du champ
   * @param value - Nouvelle valeur
   */
  const handleInputChange = (field: keyof RegisterCandidatData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  /**
   * Gère la soumission du formulaire
   * @param e - Événement de soumission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')

    // Validation basique
    if (!formData.prenom || !formData.nom || !formData.email || !formData.password || 
        !formData.dateNaissance || !formData.posteActuel || !formData.entrepriseActuelle) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      await registerCandidat(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Inscription Candidat</h1>
              <p className="text-muted-foreground">Créez votre profil pour postuler aux offres</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                type="text"
                value={formData.prenom}
                onChange={(e) => handleInputChange('prenom', e.target.value)}
                placeholder="Votre prénom"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                type="text"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateNaissance">Date de naissance *</Label>
            <Input
              id="dateNaissance"
              type="date"
              value={formData.dateNaissance}
              onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="posteActuel">Poste actuel *</Label>
              <Input
                id="posteActuel"
                type="text"
                value={formData.posteActuel}
                onChange={(e) => handleInputChange('posteActuel', e.target.value)}
                placeholder="Ex: Développeur Frontend"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entrepriseActuelle">Entreprise actuelle *</Label>
              <Input
                id="entrepriseActuelle"
                type="text"
                value={formData.entrepriseActuelle}
                onChange={(e) => handleInputChange('entrepriseActuelle', e.target.value)}
                placeholder="Ex: TechCorp"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn (optionnel)</Label>
            <Input
              id="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/votre-profil"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon compte candidat
          </Button>
        </form>
      </div>
    </div>
  )
}
