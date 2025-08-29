from __future__ import annotations

import os
import json
import time
from typing import Dict, Any, Optional
from pathlib import Path

try:
    import openai
except ImportError:
    openai = None

from .config import config
from .io import read_any, clean_text


class OpenAIScorer:
    """Scorer utilisant l'API OpenAI pour un scoring haute performance."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        if openai is None:
            raise ImportError("pip install openai required")
        
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("Clé API OpenAI requise (OPENAI_API_KEY env var)")
        
        # Configuration OpenAI
        openai.api_key = self.api_key
        self.model = model
        self.max_retries = 3
        self.retry_delay = 1.0
    
    def _create_scoring_prompt(self, cv_text: str, job_text: str) -> str:
        """Crée le prompt optimisé pour le scoring."""
        return f"""Tu es un expert en recrutement RH. Analyse ce CV par rapport à cette offre d'emploi.

OFFRE D'EMPLOI:
{job_text[:1500]}

CV DU CANDIDAT:
{cv_text[:2500]}

CONSIGNES:
- Évalue la correspondance entre le CV et l'offre
- Considère : compétences techniques, expérience, formation, secteur d'activité
- Score de 0 à 100 où :
  * 90-100: Candidat parfait, correspondance excellente
  * 75-89: Très bon candidat, bonnes compétences
  * 60-74: Candidat correct, quelques compétences manquantes
  * 40-59: Candidat moyen, écart important
  * 20-39: Candidat faible, peu de correspondance
  * 0-19: Aucune correspondance

RÉPONSE:
Réponds UNIQUEMENT par un nombre entier entre 0 et 100, sans explication."""

    def _call_openai_api(self, prompt: str) -> Optional[int]:
        """Appel sécurisé à l'API OpenAI avec retry."""
        for attempt in range(self.max_retries):
            try:
                response = openai.ChatCompletion.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=10,
                    temperature=0.1,
                    timeout=30
                )
                
                content = response.choices[0].message.content.strip()
                
                # Extraction du score
                try:
                    score = int(content)
                    if 0 <= score <= 100:
                        return score
                except ValueError:
                    pass
                
                # Fallback: cherche un nombre dans la réponse
                import re
                numbers = re.findall(r'\b(\d{1,3})\b', content)
                for num_str in numbers:
                    num = int(num_str)
                    if 0 <= num <= 100:
                        return num
                
                return None
                
            except Exception as e:
                print(f"Erreur API OpenAI (tentative {attempt + 1}): {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    return None
        
        return None
    
    def score_cv_vs_offer(self, cv_text_or_path: str, offer: Dict[str, Any] | str) -> Optional[int]:
        """Score un CV contre une offre via OpenAI."""
        # Prépare les textes
        if Path(cv_text_or_path).exists():
            cv_text = clean_text(read_any(cv_text_or_path))
        else:
            cv_text = clean_text(cv_text_or_path)
        
        if isinstance(offer, str):
            job_text = clean_text(offer)
        else:
            # Synthèse de l'offre
            parts = []
            for key in ["title", "description", "company", "salary", "experience"]:
                if key in offer and offer[key]:
                    parts.append(f"{key.title()}: {offer[key]}")
            
            for key in ["keywords", "programming", "tools", "languages"]:
                values = offer.get(key, [])
                if isinstance(values, list) and values:
                    parts.append(f"{key.title()}: {', '.join(values)}")
            
            job_text = clean_text("\n".join(parts))
        
        # Scoring OpenAI
        prompt = self._create_scoring_prompt(cv_text, job_text)
        return self._call_openai_api(prompt)
    
    def batch_score(self, cv_list: list, offer: Dict[str, Any] | str, delay: float = 0.1) -> list:
        """Score multiple CVs contre une offre (avec rate limiting)."""
        results = []
        for i, cv in enumerate(cv_list):
            score = self.score_cv_vs_offer(cv, offer)
            results.append({
                "cv": cv,
                "score": score,
                "index": i
            })
            if delay > 0 and i < len(cv_list) - 1:
                time.sleep(delay)
        
        return results


# Fonction utilitaire
def test_openai_scorer():
    """Test rapide du scorer OpenAI."""
    try:
        scorer = OpenAIScorer()
        
        # Test simple
        cv_test = "Développeur Python avec 3 ans d'expérience. Spécialisé en machine learning, PyTorch, API REST."
        offer_test = {
            "title": "Senior Python Developer",
            "description": "Recherche développeur Python expérimenté pour projets IA",
            "keywords": ["python", "machine learning", "api"]
        }
        
        score = scorer.score_cv_vs_offer(cv_test, offer_test)
        print(f"Test OpenAI scorer: {score}/100")
        return score is not None
        
    except Exception as e:
        print(f"Erreur test OpenAI: {e}")
        return False


if __name__ == "__main__":
    test_openai_scorer()
