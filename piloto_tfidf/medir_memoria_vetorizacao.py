"""
Orquestra a medição de vetorização em três processos Python separados.

Uso:
  python medir_memoria_vetorizacao.py
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data" / "metricasReais.json"
PY = BASE / ".venv" / "Scripts" / "python.exe"
WORKER = BASE / "medir_vetorizacao_worker.py"
REPRS = [
    ("tfidf", "TF-IDF"),
    ("st", "Sentence-Transformers"),
    ("llm", "LLM Embeddings"),
]


def rodar_subprocess(repr_key: str) -> dict:
    saida = OUT / f"_vetorizacao_{repr_key}.json"
    cmd = [str(PY), str(WORKER), "--repr", repr_key, "--saida", str(saida)]
    print(f"Subprocesso {repr_key}: {' '.join(cmd)}", flush=True)
    if repr_key == "llm":
        print("  (Qwen em CPU: cerca de 25–30 min; saída abaixo vem do worker)", flush=True)
    proc = subprocess.run(cmd)
    if proc.returncode != 0:
        raise SystemExit(f"Falha em {repr_key} (código {proc.returncode})")
    if saida.exists():
        return json.loads(saida.read_text(encoding="utf-8"))
    return json.loads(proc.stdout.strip().splitlines()[-1])


def sincronizar_tempos_custo(ui: dict, medicoes: dict[str, dict]) -> None:
    vet = {
        "tfidf": medicoes["tfidf"]["tempo_seg"],
        "st": medicoes["st"]["tempo_seg"],
        "llm": medicoes["llm"]["tempo_seg"],
    }
    for comb in ui.get("combinacoes9") or []:
        key = comb.get("representacaoKey")
        if key not in vet:
            continue
        comb["tempoVetorizacao"] = vet[key]
        treino = float(comb.get("tempoTreinamento") or 0)
        infer = float(comb.get("tempoInferencia") or 0)
        comb["tempoTotal"] = round(vet[key] + treino + infer, 3)
    for linha in ui.get("classificacaoRigorosa") or []:
        key = linha.get("representacao_key")
        if key in vet:
            linha["tempo_vetorizacao_seg"] = vet[key]


def atualizar_ranking(ui: dict, medicoes: dict[str, dict]) -> None:
    for item in ui.get("ranking") or []:
        metodo = item.get("metodo")
        bloco = next((m for m in medicoes.values() if m["metodo_ranking"] == metodo), None)
        if not bloco:
            continue
        if "tempo_vetorizacao_seg_protocolo_anterior" not in item:
            item["tempo_vetorizacao_seg_protocolo_anterior"] = item.get("tempo_vetorizacao_seg")
        item["tempo_vetorizacao_seg"] = bloco["tempo_seg"]
        item["memoria_vetorizacao_delta_mib"] = bloco["memoria_rss_delta_mib"]
        item["memoria_vetorizacao_pico_mib"] = bloco["memoria_rss_pico_mib"]


def main():
    if not PY.exists():
        raise SystemExit(f"Intérprete não encontrado: {PY}")
    medicoes = {}
    for key, _ in REPRS:
        medicoes[key] = rodar_subprocess(key)

    payload = {
        "unidade_memoria": "MiB (RSS do processo Python, 1 MiB = 1024² bytes)",
        "protocolo_medicao": medicoes["tfidf"]["protocolo_medicao"],
        "nota": (
            "Cada representação foi medida em um processo novo, sem compartilhar RSS "
            "com BGE ou Qwen. O tempo inclui carga (densos), vaga, 100 currículos e cosseno."
        ),
        "tfidf": medicoes["tfidf"],
        "sentence_transformers": medicoes["st"],
        "llm_embeddings": medicoes["llm"],
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "memoria_vetorizacao.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    if UI.exists():
        ui = json.loads(UI.read_text(encoding="utf-8"))
        ui["memoriaVetorizacao"] = payload
        atualizar_ranking(ui, medicoes)
        sincronizar_tempos_custo(ui, medicoes)
        ui["geradoEm"] = __import__("pandas").Timestamp.now().isoformat()
        UI.write_text(json.dumps(ui, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Salvo:", OUT / "memoria_vetorizacao.json")
    for k, v in medicoes.items():
        print(f"  {k}: {v['tempo_seg']}s | delta RSS {v['memoria_rss_delta_mib']} MiB")


if __name__ == "__main__":
    main()
