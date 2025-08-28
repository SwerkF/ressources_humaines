from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


@dataclass
class Paths:
    base_dir: Path = Path(__file__).resolve().parents[2]
    ai_dir: Path = base_dir / "AI"
    data_dir: Path = ai_dir / "data"
    raw_dir: Path = data_dir / "raw"
    processed_dir: Path = data_dir / "processed"
    models_dir: Path = ai_dir / "models"


@dataclass
class ModelConfig:
    # Nom du modèle Sentence-Transformers par défaut
    encoder_name: str = os.getenv("AI_ENCODER", "sentence-transformers/msmarco-distilbert-base-v4")
    device: str = os.getenv("AI_DEVICE", "cpu")
    model_dir: Path = Path(os.getenv("AI_MODEL_DIR", str(Paths.models_dir / "latest")))


paths = Paths()
config = ModelConfig()

# Crée les dossiers si nécessaires (facilite l'onboarding)
for p in [paths.data_dir, paths.raw_dir, paths.processed_dir, paths.models_dir, config.model_dir]:
    try:
        p.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass