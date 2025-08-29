from __future__ import annotations

import json
import pandas as pd
from pathlib import Path
from typing import List, Tuple
from datetime import datetime
import random

from sentence_transformers import SentenceTransformer, InputExample, losses
from sentence_transformers.evaluation import EmbeddingSimilarityEvaluator
from torch.utils.data import DataLoader
import torch

from .config import config, paths
from .io import clean_text
from .embedder import BiEncoder


def load_resume_data(csv_path: str | Path) -> pd.DataFrame:
    """Charge Resume.csv et nettoie les données."""
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=['Resume_str', 'Category'])
    df['Resume_clean'] = df['Resume_str'].apply(clean_text)
    return df


def create_contrastive_pairs(df: pd.DataFrame, samples_per_category: int = 50) -> List[InputExample]:
    """Crée des paires contrastives pour l'entraînement.
    
    - Positifs: CV même catégorie (score 0.8)
    - Négatifs: CV catégories différentes (score 0.2)
    """
    examples = []
    categories = df['Category'].unique()
    
    for category in categories:
        category_cvs = df[df['Category'] == category]['Resume_clean'].tolist()
        other_cvs = df[df['Category'] != category]['Resume_clean'].sample(
            min(len(category_cvs), 100)
        ).tolist()
        
        # Paires positives (même catégorie)
        if len(category_cvs) >= 2:
            pairs = min(samples_per_category, len(category_cvs) // 2)
            for _ in range(pairs):
                cv1, cv2 = random.sample(category_cvs, 2)
                examples.append(InputExample(texts=[cv1, cv2], label=0.8))
        
        # Paires négatives (catégories différentes)
        neg_pairs = min(samples_per_category, len(category_cvs), len(other_cvs))
        for i in range(neg_pairs):
            cv1 = random.choice(category_cvs)
            cv2 = random.choice(other_cvs)
            examples.append(InputExample(texts=[cv1, cv2], label=0.2))
    
    random.shuffle(examples)
    return examples


def train_model(
    csv_path: str | Path = paths.data_dir / "resume" / "Resume.csv",
    base_model: str = config.encoder_name,
    epochs: int = 2,
    batch_size: int = 16,
    lr: float = 2e-5,
    output_dir: str | Path | None = None
) -> Path:
    """Entraîne un modèle bi-encodeur sur Resume.csv."""
    
    print(f"Chargement des données depuis {csv_path}...")
    df = load_resume_data(csv_path)
    print(f"Dataset: {len(df)} CV, {df['Category'].nunique()} catégories")
    
    print("Création des paires contrastives...")
    train_examples = create_contrastive_pairs(df, samples_per_category=30)
    eval_examples = create_contrastive_pairs(df, samples_per_category=10)
    print(f"Entraînement: {len(train_examples)} paires")
    print(f"Évaluation: {len(eval_examples)} paires")
    
    # Modèle
    print(f"Chargement du modèle de base: {base_model}")
    model = SentenceTransformer(base_model)
    
    # DataLoaders
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)
    
    # Loss function
    train_loss = losses.CosineSimilarityLoss(model)
    
    # Évaluateur
    evaluator = EmbeddingSimilarityEvaluator.from_input_examples(
        eval_examples, name="resume-similarity"
    )
    
    # Répertoire de sortie
    if output_dir is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = paths.models_dir / f"resume_model_{timestamp}"
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Démarrage de l'entraînement ({epochs} epochs)...")
    
    warmup_steps = max(1, len(train_dataloader) // 10)
    evaluation_steps = max(1, len(train_dataloader) // 2)
    
    # Entraînement manuel compatible
    model._modules['0'].auto_model.train()
    
    for epoch in range(epochs):
        print(f"Epoch {epoch + 1}/{epochs}")
        total_loss = 0
        num_batches = 0
        
        for batch in train_dataloader:
            features, labels = batch
            loss_value = train_loss(features, labels)
            loss_value.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            
            # Pas d'optimiseur explicite, utilise celui de Sentence-Transformers
            if hasattr(model, '_get_optimizer'):
                optimizer = model._get_optimizer([train_loss], 2e-5)
                optimizer.step()
                optimizer.zero_grad()
            
            total_loss += loss_value.item()
            num_batches += 1
        
        avg_loss = total_loss / max(1, num_batches)
        print(f"Loss moyenne: {avg_loss:.4f}")
        
        # Évaluation
        if evaluator:
            score = evaluator(model, str(output_dir), epoch)
            print(f"Score évaluation: {score:.4f}")
    
    # Sauvegarde manuelle
    model.save(str(output_dir))
    
    # Métadonnées
    metadata = {
        "model_name": base_model,
        "dataset": str(csv_path),
        "num_examples": len(train_examples),
        "num_categories": df['Category'].nunique(),
        "epochs": epochs,
        "batch_size": batch_size,
        "learning_rate": lr,
        "timestamp": timestamp,
        "categories": df['Category'].value_counts().to_dict()
    }
    
    with open(output_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    # Lien vers latest
    latest_dir = paths.models_dir / "latest"
    if latest_dir.exists() and latest_dir.is_symlink():
        latest_dir.unlink()
    elif latest_dir.exists():
        import shutil
        shutil.rmtree(latest_dir)
    
    try:
        latest_dir.symlink_to(output_dir.name, target_is_directory=True)
    except OSError:
        # Windows fallback: copie
        import shutil
        shutil.copytree(output_dir, latest_dir, dirs_exist_ok=True)
    
    print(f"Modèle sauvegardé dans: {output_dir}")
    print(f"Lien latest mis à jour: {latest_dir}")
    
    return output_dir


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Entraînement du modèle multi-métiers")
    parser.add_argument("--csv", default=str(paths.data_dir / "resume" / "Resume.csv"))
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--output", default=None)
    
    args = parser.parse_args()
    train_model(
        csv_path=args.csv,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        output_dir=args.output
    )
