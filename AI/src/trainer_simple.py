from __future__ import annotations

import json
import pandas as pd
from pathlib import Path
from datetime import datetime
import random

from sentence_transformers import SentenceTransformer, InputExample, losses, util
from torch.utils.data import DataLoader

from .config import config, paths
from .io import clean_text


def load_resume_data(csv_path: str | Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=['Resume_str', 'Category'])
    df['Resume_clean'] = df['Resume_str'].apply(clean_text)
    return df


def create_training_data(df: pd.DataFrame, samples_per_category: int = 30) -> list:
    examples = []
    categories = df['Category'].unique()
    
    for category in categories:
        category_cvs = df[df['Category'] == category]['Resume_clean'].tolist()
        other_cvs = df[df['Category'] != category]['Resume_clean'].sample(
            min(len(category_cvs), 50)
        ).tolist()
        
        # Paires positives (même catégorie, score élevé)
        if len(category_cvs) >= 2:
            pairs = min(samples_per_category, len(category_cvs) // 2)
            for _ in range(pairs):
                cv1, cv2 = random.sample(category_cvs, 2)
                examples.append(InputExample(texts=[cv1, cv2], label=0.85))
        
        # Paires négatives (catégories différentes, score faible)
        neg_pairs = min(samples_per_category, len(category_cvs), len(other_cvs))
        for i in range(neg_pairs):
            cv1 = random.choice(category_cvs)
            cv2 = random.choice(other_cvs)
            examples.append(InputExample(texts=[cv1, cv2], label=0.15))
    
    random.shuffle(examples)
    return examples


def train_simple(
    csv_path: str | Path = paths.data_dir / "resume" / "Resume.csv",
    epochs: int = 1,
    batch_size: int = 16
) -> Path:
    print(f"Chargement des données depuis {csv_path}...")
    df = load_resume_data(csv_path)
    print(f"Dataset: {len(df)} CV, {df['Category'].nunique()} catégories")
    
    print("Création des exemples d'entraînement...")
    train_examples = create_training_data(df, samples_per_category=20)
    print(f"Entraînement: {len(train_examples)} exemples")
    
    # Modèle
    print(f"Chargement du modèle: {config.encoder_name}")
    model = SentenceTransformer(config.encoder_name)
    
    # DataLoader
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)
    
    # Loss
    train_loss = losses.CosineSimilarityLoss(model)
    
    # Répertoire de sortie
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = paths.models_dir / f"resume_model_{timestamp}"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Entraînement ({epochs} epochs)...")
    
    # Entraînement simple
    for epoch in range(epochs):
        print(f"Epoch {epoch + 1}/{epochs}")
        model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=1,
            warmup_steps=10,
            show_progress_bar=True
        )
    
    # Sauvegarde
    model.save(str(output_dir))
    print(f"Modèle sauvegardé: {output_dir}")
    
    # Métadonnées
    metadata = {
        "model_name": config.encoder_name,
        "dataset": str(csv_path),
        "num_examples": len(train_examples),
        "num_categories": df['Category'].nunique(),
        "epochs": epochs,
        "batch_size": batch_size,
        "timestamp": timestamp
    }
    
    with open(output_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    # Mise à jour du lien latest
    latest_dir = paths.models_dir / "latest"
    if latest_dir.exists():
        import shutil
        shutil.rmtree(latest_dir)
    
    import shutil
    shutil.copytree(output_dir, latest_dir)
    print(f"Lien latest mis à jour: {latest_dir}")
    
    return output_dir


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Entraînement simple du modèle")
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--batch_size", type=int, default=16)
    
    args = parser.parse_args()
    train_simple(epochs=args.epochs, batch_size=args.batch_size)
