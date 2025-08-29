from __future__ import annotations

import argparse
import json
from pathlib import Path
from glob import glob

from .service import ScoringService
from .hybrid_service import HybridScoringService


def _read_json(path: str) -> object:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    return json.loads(text)


def cmd_score(args) -> None:
    # Utilise hybrid service si --openai, sinon service local
    if getattr(args, 'openai', False):
        svc = HybridScoringService()
        offer = _read_json(args.offer_json)
        result = svc.score_cv_vs_offer(args.cv, offer)
        print(json.dumps({
            "score_0_100": result.score_0_100,
            "similarity": result.similarity,
            "openai_score": result.openai_score,
            "local_score": result.local_score,
            "method_used": result.method_used,
            "offer_id": result.offer_id,
            "meta": result.meta,
        }, ensure_ascii=False))
    else:
        svc = ScoringService()
        offer = _read_json(args.offer_json)
        result = svc.score_cv_vs_offer(args.cv, offer)
        print(json.dumps({
            "score_0_100": result.score_0_100,
            "similarity": result.similarity,
            "offer_id": result.offer_id,
            "meta": result.meta,
        }, ensure_ascii=False))


def cmd_recommend(args) -> None:
    svc = ScoringService()
    offers = _read_json(args.offers_json)
    top_k = int(args.top_k)
    results = svc.recommend_offers_for_cv(args.cv, offers, top_k=top_k)
    payload = [{
        "offer_id": r.offer_id,
        "score_0_100": r.score_0_100,
        "similarity": r.similarity,
        "meta": r.meta,
    } for r in results]
    print(json.dumps(payload, ensure_ascii=False))


def cmd_rank_candidates(args) -> None:
    svc = ScoringService()
    offer = _read_json(args.offer_json)
    top_k = int(args.top_k)
    
    # Cherche tous les CV dans le répertoire
    cv_dir = Path(args.cvs_dir)
    cv_files = []
    for ext in ["*.pdf", "*.docx", "*.txt"]:
        cv_files.extend(glob(str(cv_dir / ext)))
    
    if not cv_files:
        print(f"Aucun CV trouvé dans {cv_dir}")
        return
    
    results = svc.rank_candidates_for_offer(offer, cv_files, top_k=top_k)
    payload = [{
        "candidate_id": r.offer_id,  # ici c'est l'ID du candidat
        "score_0_100": r.score_0_100,
        "similarity": r.similarity,
        "meta": r.meta,
    } for r in results]
    print(json.dumps(payload, ensure_ascii=False))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AI CLI: scoring and recommendations")
    sub = parser.add_subparsers(dest="command", required=True)

    p1 = sub.add_parser("score_cv_vs_offer", help="Score a CV against a single offer JSON")
    p1.add_argument("--cv", required=True, help="Path to CV file (pdf/docx/txt) or raw text")
    p1.add_argument("--offer_json", required=True, help="Path to offer JSON file")
    p1.add_argument("--openai", action="store_true", help="Use OpenAI API for high-quality scoring")
    p1.set_defaults(func=cmd_score)

    p2 = sub.add_parser("recommend_offers_for_cv", help="Recommend top-k offers for a CV from a JSON list")
    p2.add_argument("--cv", required=True, help="Path to CV file (pdf/docx/txt) or raw text")
    p2.add_argument("--offers_json", required=True, help="Path to JSON array of offers")
    p2.add_argument("--top_k", default=5, help="Number of offers to return")
    p2.set_defaults(func=cmd_recommend)

    p3 = sub.add_parser("rank_candidates_for_offer", help="Rank candidates for a single offer")
    p3.add_argument("--offer_json", required=True, help="Path to offer JSON file")
    p3.add_argument("--cvs_dir", required=True, help="Directory containing CV files")
    p3.add_argument("--top_k", default=10, help="Number of candidates to return")
    p3.set_defaults(func=cmd_rank_candidates)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()