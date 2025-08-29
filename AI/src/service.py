from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import math

from .config import config
from .io import read_any, clean_text
from .embedder import BiEncoder


def synthesize_job_text(offer: Dict[str, Any] | str) -> str:
    if isinstance(offer, str):
        return clean_text(offer)
    parts: List[str] = []
    # Champs communs
    for key in ["title", "description", "company", "salary", "contract", "location", "work", "experience"]:
        if key in offer and offer[key]:
            parts.append(str(offer[key]))
    # Listes de mots-clés
    for key in ["programming", "languages", "tools", "diplomas", "keywords"]:
        values = offer.get(key)
        if isinstance(values, list) and values:
            parts.append(", ".join(map(str, values)))
    return clean_text(" \n ".join(parts))


def to_score(similarity: float) -> float:
    # Similarité cosinus [-1..1] -> score [0..100]
    return max(0.0, min(100.0, (similarity + 1.0) * 50.0))


def cosine_similarity(vec_a, vec_b) -> float:
    import numpy as np

    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1e-12
    return float(np.dot(a, b) / denom)


@dataclass
class ScoreOutput:
    score_0_100: float
    similarity: float
    offer_id: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None


class ScoringService:
    def __init__(self, model_name_or_dir: str | Path | None = None):
        self.encoder = BiEncoder(model_name_or_dir or config.model_dir)

    def _encode_single(self, text: str):
        return self.encoder.encode([text])[0]

    def score_cv_vs_offer(self, cv_text_or_path: str, offer: Dict[str, Any] | str) -> ScoreOutput:
        if Path(cv_text_or_path).exists():
            cv_text = read_any(cv_text_or_path)
        else:
            cv_text = cv_text_or_path
        cv_text = clean_text(cv_text)
        job_text = synthesize_job_text(offer)

        cv_vec = self._encode_single(cv_text)
        job_vec = self._encode_single(job_text)
        sim = cosine_similarity(cv_vec, job_vec)
        return ScoreOutput(
            score_0_100=to_score(sim),
            similarity=sim,
            offer_id=str(offer.get("id")) if isinstance(offer, dict) and offer.get("id") is not None else None,
            meta={"encoder": str(config.encoder_name)},
        )

    def recommend_offers_for_cv(self, cv_text_or_path: str, offers: Iterable[Dict[str, Any]], top_k: int = 5) -> List[ScoreOutput]:
        if Path(cv_text_or_path).exists():
            cv_text = read_any(cv_text_or_path)
        else:
            cv_text = cv_text_or_path
        cv_text = clean_text(cv_text)

        job_texts: List[str] = [synthesize_job_text(o) for o in offers]
        ids: List[Optional[str]] = [str(o.get("id")) if o.get("id") is not None else None for o in offers]

        cv_vec = self._encode_single(cv_text)
        job_vecs = self.encoder.encode(job_texts)

        scored: List[ScoreOutput] = []
        for offer_vec, offer_id in zip(job_vecs, ids):
            sim = cosine_similarity(cv_vec, offer_vec)
            scored.append(ScoreOutput(score_0_100=to_score(sim), similarity=sim, offer_id=offer_id, meta={"encoder": str(config.encoder_name)}))

        scored.sort(key=lambda s: s.score_0_100, reverse=True)
        return scored[: max(1, int(top_k))]

    def rank_candidates_for_offer(self, offer: Dict[str, Any] | str, cv_paths_or_texts: Iterable[str], top_k: int = 10) -> List[ScoreOutput]:
        job_text = synthesize_job_text(offer)
        job_vec = self._encode_single(job_text)

        cv_texts: List[str] = []
        cv_ids: List[str] = []
        for i, cv_input in enumerate(cv_paths_or_texts):
            if Path(cv_input).exists():
                cv_text = clean_text(read_any(cv_input))
                cv_id = Path(cv_input).stem  # nom fichier sans extension
            else:
                cv_text = clean_text(cv_input)
                cv_id = f"cv_{i}"
            cv_texts.append(cv_text)
            cv_ids.append(cv_id)

        cv_vecs = self.encoder.encode(cv_texts)

        scored: List[ScoreOutput] = []
        for cv_vec, cv_id in zip(cv_vecs, cv_ids):
            sim = cosine_similarity(cv_vec, job_vec)
            scored.append(ScoreOutput(
                score_0_100=to_score(sim), 
                similarity=sim, 
                offer_id=cv_id,  # ici c'est l'ID du candidat
                meta={"encoder": str(config.encoder_name)}
            ))

        scored.sort(key=lambda s: s.score_0_100, reverse=True)
        return scored[: max(1, int(top_k))]