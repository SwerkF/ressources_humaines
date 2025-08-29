from __future__ import annotations

from pathlib import Path
from typing import Iterable, List

from sentence_transformers import SentenceTransformer

from .config import config


class BiEncoder:
    """Convertit des textes en vecteurs (embeddings) avec un modèle BERT.

    Utilisation:
        encoder = BiEncoder()
        vectors = encoder.encode(["un texte", "un autre texte"])
    """

    def __init__(self, model_name_or_dir: str | Path | None = None, device: str | None = None):
        source = self._resolve_source(model_name_or_dir)
        self.model = SentenceTransformer(source, device=device or config.device)

    @staticmethod
    def _resolve_source(model_name_or_dir: str | Path | None) -> str:
        # 1) Si un chemin local valide est fourni (ou config.model_dir), on le prend
        candidates: list[Path] = []
        if model_name_or_dir is not None:
            candidates.append(Path(model_name_or_dir))
        else:
            candidates.append(Path(config.model_dir))

        for cand in candidates:
            try:
                if cand and cand.exists() and cand.is_dir():
                    # Vérifie présence de fichiers typiques Sentence-Transformers/HF
                    if (cand / "config.json").exists() or (cand / "modules.json").exists() or (cand / "sentence_bert_config.json").exists():
                        return str(cand)
            except Exception:
                pass

        # 2) Fallback: modèle pré-entraîné par défaut
        return str(config.encoder_name)

    def encode(self, texts: Iterable[str], batch_size: int = 32, normalize: bool = True) -> List[list[float]]:
        return self.model.encode(
            list(texts),
            batch_size=batch_size,
            convert_to_numpy=False,
            normalize_embeddings=normalize,
            show_progress_bar=False,
        )

    def save(self, target_dir: str | Path) -> None:
        target = Path(target_dir)
        target.mkdir(parents=True, exist_ok=True)
        self.model.save(str(target))