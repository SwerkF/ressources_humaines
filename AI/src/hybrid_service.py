from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
import os

from .config import config
from .io import read_any, clean_text
from .service import ScoringService, ScoreOutput
from .openai_scorer import OpenAIScorer


@dataclass
class HybridScoreOutput:
    score_0_100: float
    similarity: Optional[float]
    openai_score: Optional[int]
    local_score: Optional[float]
    method_used: str  # "openai", "local", "hybrid"
    offer_id: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None


class HybridScoringService:
    """Service de scoring hybride : OpenAI (précis) + Local (fallback)."""
    
    def __init__(self, use_openai: bool = True, openai_ratio: float = 1.0):
        """
        Args:
            use_openai: Activer OpenAI (nécessite OPENAI_API_KEY)
            openai_ratio: Ratio d'utilisation OpenAI (1.0 = toujours, 0.0 = jamais)
        """
        self.local_service = ScoringService()
        self.use_openai = use_openai and bool(os.getenv("OPENAI_API_KEY"))
        self.openai_ratio = openai_ratio
        
        if self.use_openai:
            try:
                self.openai_scorer = OpenAIScorer()
                print("✅ OpenAI scorer activé")
            except Exception as e:
                print(f"⚠️ OpenAI indisponible: {e}")
                self.use_openai = False
                self.openai_scorer = None
        else:
            self.openai_scorer = None
            print("📡 Mode local uniquement")
    
    def _should_use_openai(self) -> bool:
        """Détermine si on utilise OpenAI pour ce scoring."""
        if not self.use_openai or self.openai_ratio <= 0:
            return False
        if self.openai_ratio >= 1.0:
            return True
        
        import random
        return random.random() < self.openai_ratio
    
    def score_cv_vs_offer(self, cv_text_or_path: str, offer: Dict[str, Any] | str) -> HybridScoreOutput:
        """Score hybride CV vs offre."""
        local_result = self.local_service.score_cv_vs_offer(cv_text_or_path, offer)
        
        openai_score = None
        method_used = "local"
        final_score = local_result.score_0_100
        
        # Tentative OpenAI
        if self._should_use_openai():
            try:
                openai_score = self.openai_scorer.score_cv_vs_offer(cv_text_or_path, offer)
                if openai_score is not None:
                    final_score = float(openai_score)
                    method_used = "openai"
                    print(f"🤖 OpenAI: {openai_score}/100 (vs local: {local_result.score_0_100:.1f})")
            except Exception as e:
                print(f"⚠️ OpenAI fallback: {e}")
        
        return HybridScoreOutput(
            score_0_100=final_score,
            similarity=local_result.similarity,
            openai_score=openai_score,
            local_score=local_result.score_0_100,
            method_used=method_used,
            offer_id=local_result.offer_id,
            meta={"local_meta": local_result.meta, "method": method_used}
        )
    
    def rank_candidates_for_offer(self, offer: Dict[str, Any] | str, cv_paths_or_texts: Iterable[str], top_k: int = 10) -> List[HybridScoreOutput]:
        """Classe les candidats pour une offre (hybrid)."""
        candidates = []
        
        for i, cv_input in enumerate(cv_paths_or_texts):
            cv_id = Path(cv_input).stem if Path(cv_input).exists() else f"cv_{i}"
            result = self.score_cv_vs_offer(cv_input, offer)
            result.offer_id = cv_id  # ID du candidat
            candidates.append(result)
        
        candidates.sort(key=lambda c: c.score_0_100, reverse=True)
        return candidates[:max(1, int(top_k))]
    
    def recommend_offers_for_cv(self, cv_text_or_path: str, offers: Iterable[Dict[str, Any]], top_k: int = 5) -> List[HybridScoreOutput]:
        """Recommande les offres pour un CV (hybrid)."""
        scored_offers = []
        
        for offer in offers:
            result = self.score_cv_vs_offer(cv_text_or_path, offer)
            result.offer_id = str(offer.get("id")) if offer.get("id") is not None else None
            scored_offers.append(result)
        
        scored_offers.sort(key=lambda o: o.score_0_100, reverse=True)
        return scored_offers[:max(1, int(top_k))]
    
    def get_stats(self) -> Dict[str, Any]:
        """Statistiques d'utilisation."""
        return {
            "openai_available": self.use_openai,
            "openai_ratio": self.openai_ratio,
            "local_model": str(config.encoder_name)
        }
