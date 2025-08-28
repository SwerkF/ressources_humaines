import { type JSX } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Briefcase, Euro } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  isSelected: boolean
  onClick: () => void
}

/**
 * Carte d'offre d'emploi dans la liste
 * @param job - Offre d'emploi à afficher
 * @param isSelected - Indique si cette offre est sélectionnée
 * @param onClick - Fonction appelée lors du clic sur la carte
 * @returns {JSX.Element}
 */
export default function JobCard({ job, isSelected, onClick }: JobCardProps): JSX.Element {
  /**
   * Formate la date de création
   * @param date - Date à formater
   * @returns Date formatée en français
   */
  const formatDate = (date: Date): string => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Aujourd'hui"
    if (diffInDays === 1) return "Hier"
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: diffInDays > 365 ? 'numeric' : undefined
    })
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border-2",
        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <img
            src={job.image}
            alt={`Logo ${job.company}`}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2">
              {job.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-2">
              {job.company}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {job.contract}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {job.work}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{job.location}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Euro className="h-3 w-3" />
            <span>{job.salary}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            <span>{job.experience}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(job.createdAt)}</span>
          </div>
        </div>
        
        {job.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {job.keywords.slice(0, 3).map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {job.keywords.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{job.keywords.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
