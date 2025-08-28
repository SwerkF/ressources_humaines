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
        name_or_dir = str(model_name_or_dir or config.model_dir or config.encoder_name)
        self.model = SentenceTransformer(name_or_dir, device=device or config.device)

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

