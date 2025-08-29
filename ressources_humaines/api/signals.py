"""
Signaux Django pour déclencher automatiquement l'analyse IA
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
import logging
import os
import sys

# Ajouter le chemin du module AI
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'AI', 'src'))

from .models import Candidature, CVAnalysis
from cv_analyzer import CVAnalyzer

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Candidature)
def trigger_ai_analysis(sender, instance, created, **kwargs):
    """
    Déclenche automatiquement l'analyse IA quand une candidature est créée
    
    Args:
        sender: Modèle qui a déclenché le signal
        instance: Instance de Candidature créée
        created: True si c'est une nouvelle création
    """
    if not created:
        return  # Seulement pour les nouvelles candidatures
    
    try:
        logger.info(f"Déclenchement automatique de l'analyse IA pour candidature {instance.id}")
        
        # Vérifier qu'on a un CV et un job
        if not instance.cv or not instance.job:
            logger.warning(f"Candidature {instance.id} sans CV ou job, analyse impossible")
            return
        
        # Créer l'analyse en statut "pending"
        cv_analysis = CVAnalysis.objects.create(
            candidature=instance,
            status='pending'
        )
        
        # Lancer l'analyse en arrière-plan (pour l'instant synchrone)
        _run_ai_analysis(cv_analysis, instance)
        
    except Exception as e:
        logger.error(f"Erreur lors du déclenchement de l'analyse IA: {e}")
        
        # Marquer l'analyse comme échouée
        try:
            if 'cv_analysis' in locals():
                cv_analysis.status = 'failed'
                cv_analysis.error_message = str(e)
                cv_analysis.save()
        except:
            pass


def _run_ai_analysis(cv_analysis: CVAnalysis, candidature: Candidature):
    """
    Exécute l'analyse IA et sauvegarde les résultats
    
    Args:
        cv_analysis: Instance CVAnalysis à mettre à jour
        candidature: Candidature à analyser
    """
    try:
        logger.info(f"Début de l'analyse IA pour candidature {candidature.id}")
        
        # Initialiser l'analyseur IA
        analyzer = CVAnalyzer()
        
        # Récupérer le fichier CV
        cv_file_path = candidature.cv.path
        if not os.path.exists(cv_file_path):
            raise FileNotFoundError(f"Fichier CV introuvable: {cv_file_path}")
        
        # Récupérer la description du job
        job_description = candidature.job.description
        
        # Lancer l'analyse
        with open(cv_file_path, 'rb') as cv_file:
            result = analyzer.analyze_cv_and_job(cv_file, job_description)
        
        if result and result.get('status') == 'completed':
            # Analyse réussie, sauvegarder les résultats
            scores = result.get('scores', {})
            
            cv_analysis.overall_score = scores.get('overall_score', 0) / 100.0  # Convertir en 0-1
            cv_analysis.skill_score = scores.get('skill_score', 0) / 100.0
            cv_analysis.experience_score = scores.get('experience_score', 0) / 100.0
            cv_analysis.education_score = scores.get('education_score', 0) / 100.0
            
            # Extraire les informations (pour l'instant vides, on pourra les enrichir plus tard)
            cv_analysis.skills_extracted = []
            cv_analysis.experience_extracted = []
            cv_analysis.education_extracted = []
            
            cv_analysis.processing_time = result.get('processing_time', 0)
            cv_analysis.status = 'completed'
            cv_analysis.error_message = ''
            
            logger.info(f"Analyse IA terminée avec succès pour candidature {candidature.id}")
            
        else:
            # Analyse échouée
            error_msg = result.get('error_message', 'Analyse échouée') if result else 'Aucun résultat'
            cv_analysis.status = 'failed'
            cv_analysis.error_message = error_msg
            
            logger.error(f"Analyse IA échouée pour candidature {candidature.id}: {error_msg}")
        
        # Sauvegarder l'analyse
        cv_analysis.save()
        
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse IA: {e}")
        
        # Marquer l'analyse comme échouée
        cv_analysis.status = 'failed'
        cv_analysis.error_message = str(e)
        cv_analysis.save()
