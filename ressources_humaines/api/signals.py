"""
Signaux Django pour déclencher automatiquement l'analyse IA
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
import logging
import os
import requests
import json
from .models import Candidature, CVAnalysis

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Candidature)
def trigger_ai_analysis(sender, instance, created, **kwargs):
    if not created:
        return  # Seulement pour les nouvelles candidatures
    
    try:
        logger.info(f"Déclenchement automatique de l'analyse IA pour candidature {instance.id}")
        
        # Vérifier qu'on a un CV et un job
        if not instance.cv or not instance.job:
            logger.warning(f"Candidature {instance.id} sans CV ou job, analyse impossible")
            return
        
        # Créer l'analyse
        cv_analysis = CVAnalysis.objects.create(
            candidature=instance
        )
        
        # Lancer l'analyse en arrière-plan (pour l'instant synchrone)
        _run_ai_analysis(cv_analysis, instance)
        
    except Exception as e:
        logger.error(f"Erreur lors du déclenchement de l'analyse IA: {e}")
        
        # Marquer l'analyse comme échouée
        try:
            if 'cv_analysis' in locals():
                cv_analysis.save()
        except:
            pass


def _run_ai_analysis(cv_analysis: CVAnalysis, candidature: Candidature):
    try:
        logger.info(f"Début de l'analyse IA pour candidature {candidature.id}")
        
        # Récupérer le fichier CV et extraire le texte
        cv_file_path = candidature.cv.path
        if not os.path.exists(cv_file_path):
            raise FileNotFoundError(f"Fichier CV introuvable: {cv_file_path}")
        
        # Extraire le texte du CV (simple lecture)
        with open(cv_file_path, 'r', encoding='utf-8', errors='ignore') as f:
            cv_text = f.read()
        
        # Récupérer la description du job
        job_description = candidature.job.description
        
        # Appel direct à Mistral API
        mistral_api_key = os.getenv('MISTRAL_API_KEY')
        if not mistral_api_key:
            raise ValueError("Clé API Mistral manquante")
        
        # Préparer le prompt
        prompt = f"""
        Tu es un expert en recrutement. Analyse ce CV par rapport à cette offre d'emploi.
        
        OFFRE D'EMPLOI:
        {job_description}
        
        CV DU CANDIDAT:
        {cv_text[:2000]}  # Limiter la taille
        
        Évalue la pertinence sur 100 points et réponds UNIQUEMENT avec ce JSON:
        {{"overall_score": 85, "skill_score": 80, "experience_score": 90, "education_score": 85}}
        """
        
        # Appel à Mistral
        headers = {
            'Authorization': f'Bearer {mistral_api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'mistral-medium',
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.3
        }
        
        response = requests.post(
            'https://api.mistral.ai/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Parser le JSON
            try:
                scores = json.loads(content)
                
                # Sauvegarder les scores
                cv_analysis.overall_score = scores.get('overall_score', 50) / 100.0
                cv_analysis.skill_score = scores.get('skill_score', 50) / 100.0
                cv_analysis.experience_score = scores.get('experience_score', 50) / 100.0
                cv_analysis.education_score = scores.get('education_score', 50) / 100.0
                
                cv_analysis.raw_analysis = f"Score global: {scores.get('overall_score', 50)}/100"
                cv_analysis.skills = "[]"
                cv_analysis.experience = "[]"
                cv_analysis.education = "[]"
                
                logger.info(f"Analyse IA réussie: {scores}")
                
            except json.JSONDecodeError:
                # Fallback si JSON invalide
                cv_analysis.overall_score = 0.5
                cv_analysis.raw_analysis = "Erreur parsing JSON"
                logger.warning("JSON invalide de Mistral, score par défaut")
        else:
            # Erreur API
            cv_analysis.overall_score = 0.5
            cv_analysis.raw_analysis = f"Erreur API: {response.status_code}"
            logger.error(f"Erreur Mistral API: {response.status_code}")
        
        # Sauvegarder
        cv_analysis.save()
        logger.info(f"Analyse IA terminée pour candidature {candidature.id}")
        
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse IA: {e}")
        cv_analysis.overall_score = 0.5
        cv_analysis.raw_analysis = f"Erreur: {str(e)}"
        cv_analysis.save()
