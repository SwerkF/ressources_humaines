from __future__ import annotations

from pathlib import Path
from typing import Optional
import re

from pypdf import PdfReader
from docx import Document


def read_pdf_text(file_path: str | Path) -> str:
    path = Path(file_path)
    reader = PdfReader(str(path))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)


def read_docx_text(file_path: str | Path) -> str:
    path = Path(file_path)
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs)


def read_txt(file_path: str | Path, encoding: Optional[str] = "utf-8") -> str:
    path = Path(file_path)
    return path.read_text(encoding=encoding)


def read_any(file_path: str | Path) -> str:
    path = Path(file_path)
    ext = path.suffix.lower()
    if ext == ".pdf":
        return read_pdf_text(path)
    if ext in {".doc", ".docx"}:
        return read_docx_text(path)
    return read_txt(path)


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def clean_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    return normalize_whitespace(text)