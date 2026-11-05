"""
Monta curriculos_piloto.json a partir da seleção em data/selecao_piloto.csv
e dos textos extraídos em curriculos_processados/cleaned_text_en_readable/.

Edite selecao_piloto.csv para incluir os currículos que VOCÊ escolheu da base.

Uso:
  python montar_piloto_archive.py
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SELECAO_PATH = BASE_DIR / "data" / "selecao_piloto.csv"
OUTPUT_PATH = BASE_DIR / "data" / "curriculos_piloto.json"
TEXT_BASE = BASE_DIR.parent / "curriculos_processados" / "cleaned_text_en_readable"

MAX_CHARS = 12000


def limpar_texto(texto: str) -> str:
    texto = re.sub(r"--- PAGE \d+ ---", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto[:MAX_CHARS]


def extrair_titulo(texto_bruto: str) -> str:
    for linha in texto_bruto.splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("--- PAGE"):
            continue
        if linha.lower() in {"summary", "skills", "experience", "highlights", "work history"}:
            continue
        return linha[:120]
    return "Currículo sem título"


def incluir_linha(valor: str) -> bool:
    return valor.strip().lower() in {"1", "sim", "s", "yes", "y", "true", "x"}


def carregar_selecao():
    if not SELECAO_PATH.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {SELECAO_PATH}")

    with SELECAO_PATH.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return [row for row in reader if incluir_linha(row.get("incluir", ""))]


def main():
    selecionados = carregar_selecao()
    if not selecionados:
        raise ValueError("Nenhum currículo marcado em selecao_piloto.csv (coluna incluir=1).")

    curriculos = []
    for idx, row in enumerate(selecionados, start=1):
        curriculo_id = row["id"].strip()
        categoria = row["categoria"].strip().lower()
        txt_path = TEXT_BASE / categoria / f"{curriculo_id}.txt"

        if not txt_path.exists():
            raise FileNotFoundError(f"Texto não encontrado: {txt_path}")

        bruto = txt_path.read_text(encoding="utf-8", errors="ignore")
        texto = limpar_texto(bruto)
        titulo = row.get("titulo") or extrair_titulo(bruto)

        curriculos.append(
            {
                "id": curriculo_id,
                "nome": titulo,
                "categoria_origem": categoria,
                "arquivo_txt": str(txt_path),
                "classificacaoManualReferencia": row.get("classificacao_referencia", "").strip(),
                "classificacaoManualConfirmada": row.get("classificacao_confirmada", "").strip(),
                "observacao": row.get("observacao", "").strip(),
                "texto": texto,
            }
        )

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(curriculos, f, ensure_ascii=False, indent=2)

    print(f"Piloto montado com {len(curriculos)} currículos reais da base archive.")
    print(f"Arquivo: {OUTPUT_PATH}")
    for c in curriculos:
        print(f"  - [{c['categoria_origem']}] {c['id']} | {c['nome'][:60]}")


if __name__ == "__main__":
    main()
