"""
Gera catálogo de todos os currículos com texto extraído da base archive.

Saída: data/catalogo_archive.csv

Uso:
  python gerar_catalogo_archive.py
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
TEXT_BASE = BASE_DIR.parent / "curriculos_processados" / "cleaned_text_en_readable"
PDF_BASE = BASE_DIR.parent / "archive" / "data" / "data"
OUTPUT = BASE_DIR / "data" / "catalogo_archive.csv"

KEYWORDS = ["python", "sql", "git", "rest", "api", "java", "javascript", "react", "docker", "backend", "database"]


def extrair_titulo(texto: str) -> str:
    for linha in texto.splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("--- PAGE"):
            continue
        if linha.lower() in {"summary", "skills", "experience", "highlights", "work history"}:
            continue
        return linha[:120]
    return "Sem título"


def normalizar_categoria_pasta(categoria: str) -> str:
    return categoria.strip().lower()


def categoria_para_pdf_dir(categoria: str) -> str:
    return categoria.upper().replace("-", "-")


def main():
    if not TEXT_BASE.exists():
        raise FileNotFoundError(f"Pasta de textos não encontrada: {TEXT_BASE}")

    linhas = []
    for cat_dir in sorted(TEXT_BASE.iterdir()):
        if not cat_dir.is_dir():
            continue
        categoria = cat_dir.name
        pdf_dir_name = categoria.replace("-", "-").upper()
        # archive usa INFORMATION-TECHNOLOGY, pasta txt usa information-technology
        pdf_guess = PDF_BASE / pdf_dir_name

        for txt_path in sorted(cat_dir.glob("*.txt")):
            texto = txt_path.read_text(encoding="utf-8", errors="ignore")
            lower = texto.lower()
            hits = sum(1 for k in KEYWORDS if k in lower)
            pdf_path = pdf_guess / f"{txt_path.stem}.pdf"

            linhas.append(
                {
                    "id": txt_path.stem,
                    "categoria": categoria,
                    "titulo_detectado": extrair_titulo(texto),
                    "caracteres": len(texto),
                    "hits_backend": hits,
                    "tem_python": int("python" in lower),
                    "tem_sql": int("sql" in lower),
                    "tem_git": int("git" in lower),
                    "tem_api_rest": int("api" in lower or "rest" in lower),
                    "caminho_txt": str(txt_path),
                    "caminho_pdf": str(pdf_path) if pdf_path.exists() else "",
                    "pdf_existe": int(pdf_path.exists()),
                }
            )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(linhas[0].keys()))
        writer.writeheader()
        writer.writerows(linhas)

    print(f"Catálogo gerado: {OUTPUT}")
    print(f"Total de currículos com texto extraído: {len(linhas)}")
    print(f"Categorias: {len({r['categoria'] for r in linhas})}")


if __name__ == "__main__":
    main()
