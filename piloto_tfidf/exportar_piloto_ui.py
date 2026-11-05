"""Exporta rankings TF-IDF, ST e LLM para a UI. Uso: python exportar_piloto_ui.py"""
from __future__ import annotations
import csv, json
from datetime import date
from pathlib import Path

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
OUT = BASE / "output"
UI = BASE.parent / "aplicacao_mockup" / "src" / "data"
RESUMO_MAX = 280
CAT = {"information-technology":"Tecnologia da Informacao","accountant":"Contabilidade","chef":"Gastronomia","teacher":"Educacao","advocate":"Juridico / Social","apparel":"Varejo / Moda","agriculture":"Agronegocio","healthcare":"Saude","hr":"Recursos Humanos","sales":"Vendas","fitness":"Educacao Fisica"}

def _metodo_llm() -> str:
    meta = OUT / "embeddings_meta.json"
    if meta.exists():
        for item in json.loads(meta.read_text(encoding="utf-8")):
            if item.get("metodo") == "LLM Embeddings" and item.get("modelo"):
                protocolo = item.get("protocolo", "extração do último hidden state")
                return f"Embeddings extraídos de {item['modelo']} ({protocolo}) + similaridade cosseno"
    return "Embeddings extraídos de LLM generativo + similaridade cosseno"

EXPORTS = [
    ("ranking_tfidf_piloto.csv", "score_tfidf", "scoreTfidf", "pilotoTfidf.json", "TF-IDF (unigramas + bigramas) + similaridade cosseno"),
    ("ranking_st_piloto.csv", "score_st", "scoreSt", "pilotoSt.json", "Sentence-Transformers (BAAI/bge-large-en-v1.5) + similaridade cosseno"),
    ("ranking_llm_piloto.csv", "score_llm", "scoreLlm", "pilotoLlm.json", None),
]

def resumo(t):
    t = t.strip()
    if len(t) <= RESUMO_MAX: return t
    return t[:RESUMO_MAX].rsplit(" ", 1)[0] + "..."

def exportar(csv_name, score_csv, score_json, ui_name, metodo):
    csv_path = OUT / csv_name
    if not csv_path.exists():
        print(f"  SKIP {ui_name} (sem {csv_name})")
        return
    vaga = json.loads((DATA / "vaga_referencia.json").read_text(encoding="utf-8"))
    curriculos = json.loads((DATA / "curriculos_piloto.json").read_text(encoding="utf-8"))
    por_id = {c["id"]: c for c in curriculos}
    with csv_path.open(encoding="utf-8-sig") as f:
        ranking = list(csv.DictReader(f))
    candidatos = []
    for linha in ranking:
        cid = linha["id"].strip()
        base = por_id.get(cid, {})
        cat = (base.get("categoria_origem") or linha.get("categoria_origem") or "").strip()
        c = {"id": cid, "nome": base.get("nome") or linha.get("nome",""), "categoriaOrigem": cat,
             "area": CAT.get(cat, cat or "Outros"), "classificacaoManual": linha.get("classificacao_manual","").strip(),
             "posicao": int(linha["posicao"]), score_json: float(linha[score_csv]),
             "resumo": resumo(base.get("texto","")), "observacao": base.get("observacao","").strip()}
        candidatos.append(c)
    contagem = {"Adequado":0,"Parcialmente Adequado":0,"Inadequado":0}
    for c in candidatos:
        if c["classificacaoManual"] in contagem: contagem[c["classificacaoManual"]] += 1
    payload = {"meta":{"fonte":"Base archive (curriculos reais em ingles)","totalCurriculos":len(candidatos),"metodo":metodo,"idioma":"en","dataGeracao":date.today().isoformat(),"contagemClassificacao":contagem},
        "vaga":{"titulo":vaga.get("titulo",""),"area":vaga.get("area",""),"empresa":vaga.get("empresa",""),"idioma":vaga.get("idioma","en"),
            "requisitosObrigatorios":vaga.get("requisitosObrigatorios",[]),"requisitosDesejaveis":vaga.get("requisitosDesejaveis",[]),"texto":vaga.get("texto","")},
        "candidatos": candidatos}
    dest = UI / ui_name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  OK {ui_name} ({len(candidatos)} candidatos, top3: {', '.join(x['id'] for x in candidatos[:3])})")

def main():
    print("Exportando para UI...")
    for csv_name, score_csv, score_json, ui_name, metodo in EXPORTS:
        exportar(csv_name, score_csv, score_json, ui_name, metodo or _metodo_llm())
    print("Concluido.")

if __name__ == "__main__": main()
