import { useState, type JSX } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import type { LoginData } from "@/types/auth"

interface LoginFormProps {
  onShowRegister: () => void
}

/**
 * Formulaire de connexion
 * @param onShowRegister - Fonction appelée pour passer au mode inscription
 * @returns {JSX.Element}
 */
export default function LoginForm({ onShowRegister }: LoginFormProps): JSX.Element {
  const { login, isLoading } = useAuthStore()
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string>('')

  /**
   * Gère les changements dans les champs du formulaire
   * @param field - Nom du champ
   * @param value - Nouvelle valeur
   */
  const handleInputChange = (field: keyof LoginData, value: string): void => {
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
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    try {
      await login(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center space-y-6 mb-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Se connecter</h1>
          <p className="text-muted-foreground mt-2">
            Entrez vos identifiants pour vous connecter
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas encore de compte ?{' '}
              <button
                onClick={onShowRegister}
                className="text-primary hover:underline font-medium"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>
    </div>
  )
}
