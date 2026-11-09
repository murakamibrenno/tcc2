"""
Copia tempo_seg de memoriaVetorizacao para combinacoes9 e classificacaoRigorosa.
Uso: python sincronizar_tempos_vetorizacao_ui.py
"""

from __future__ import annotations

import json
from pathlib import Path

UI = Path(__file__).resolve().parent.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"

KEY_VET = {
    "tfidf": "tfidf",
    "st": "sentence_transformers",
    "llm": "llm_embeddings",
}


def tempos_por_representacao(meta: dict) -> dict[str, float]:
    mv = meta.get("memoriaVetorizacao") or {}
    out: dict[str, float] = {}
    for rep_key, bloco_key in KEY_VET.items():
        t = (mv.get(bloco_key) or {}).get("tempo_seg")
        if isinstance(t, (int, float)):
            out[rep_key] = float(t)
    if len(out) == 3:
        return out
    for item in meta.get("ranking") or []:
        metodo = item.get("metodo")
        t = item.get("tempo_vetorizacao_seg")
        if not isinstance(t, (int, float)):
            continue
        if metodo == "TF-IDF":
            out.setdefault("tfidf", float(t))
        elif metodo == "Sentence-Transformers":
            out.setdefault("st", float(t))
        elif metodo == "LLM Embeddings":
            out.setdefault("llm", float(t))
    if len(out) != 3:
        raise SystemExit(f"Tempos incompletos: {out}")
    return out


def aplicar(meta: dict, vet: dict[str, float]) -> None:
    for comb in meta.get("combinacoes9") or []:
        key = comb.get("representacaoKey")
        if key not in vet:
            continue
        comb["tempoVetorizacao"] = vet[key]
        treino = float(comb.get("tempoTreinamento") or 0)
        infer = float(comb.get("tempoInferencia") or 0)
        comb["tempoTotal"] = round(vet[key] + treino + infer, 3)

    for linha in meta.get("classificacaoRigorosa") or []:
        key = linha.get("representacao_key")
        if key in vet:
            linha["tempo_vetorizacao_seg"] = vet[key]


def main():
    meta = json.loads(UI.read_text(encoding="utf-8"))
    vet = tempos_por_representacao(meta)
    aplicar(meta, vet)
    if "classificacao_nota" not in meta:
        meta["classificacao_nota"] = (
            "A chave classificacao guarda experimentos preliminares (inclui llm_* com BGE base "
            "e F1 0,7568). Não usar no artigo; a interface lê classificacaoRigorosa e combinacoes9."
        )
    UI.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Tempos de vetorização sincronizados:", vet)


if __name__ == "__main__":
    main()
