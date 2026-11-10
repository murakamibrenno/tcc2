"""Consolida referência de desenvolvimento sem sobrescrever corpus/resultados históricos."""
from __future__ import annotations
import argparse
import collections
import csv
import hashlib
import json
from pathlib import Path
from protocolo_experimento import gravar_json_atomico

BASE = Path(__file__).resolve().parent
EXCLUIDOS = {"26746496"}  # escolha documental explicitamente aprovada pelo autor
LABELS = {"Adequado", "Parcialmente Adequado", "Inadequado"}


def consolidar(registro, piloto, repo):
    decisoes = registro["decisoes_aprovadas"] + registro.get("decisoes_ia_autorizadas", [])
    por_id = {}
    for row in decisoes:
        cid = str(row["id"])
        if cid in por_id:
            raise ValueError("Decisões repetidas: " + cid)
        if row["rotulo"] not in LABELS:
            raise ValueError("Classe inválida: " + cid)
        por_id[cid] = row
    ids = [str(p["id"]) for p in piloto]
    if len(ids) != len(set(ids)):
        raise ValueError("IDs repetidos no piloto")
    if set(ids) - por_id.keys():
        raise ValueError("Revisão incompleta: " + ",".join(sorted(set(ids) - por_id.keys())))
    registros = []
    for item in piloto:
        cid = str(item["id"])
        decision = por_id[cid]
        fonte = "extracted_text_en" if cid == "10840430" else "cleaned_text_en_readable"
        relative = Path("curriculos_processados") / fonte / item["categoria_origem"] / (cid + ".txt")
        texto = (repo / relative).read_text(encoding="utf-8-sig")
        texto = texto.replace("\r\n", "\n").replace("\r", "\n")
        if not texto.strip():
            raise ValueError("Texto vazio: " + cid)
        antecipada = decision.get("tipo_aprovacao") == "autorizacao_antecipada"
        registros.append({
            "id":cid, "incluir":cid not in EXCLUIDOS, "rotulo_revisado":decision["rotulo"],
            "tipo_aprovacao":"autorizacao_antecipada" if antecipada else "ratificacao_do_caso_apresentado",
            "ratificado_individualmente_pelo_autor":not antecipada,
            "grupo_documental":"grupo_16186411" if cid in {"16186411", "26746496"} else "grupo_"+cid,
            "fonte_texto":relative.as_posix(), "sha256_texto_utf8_lf":hashlib.sha256(texto.encode()).hexdigest(),
            "caracteres_texto_integral":len(texto), "papel_experimental":"desenvolvimento",
        })
    retained = [r for r in registros if r["incluir"]]
    digest = hashlib.sha256(json.dumps(registros,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    return {"schema":1,"versao":"revisao_piloto_v1","uso":"Referência de desenvolvimento; não é teste final independente.",
            "n_documentos_revisados":len(registros),"n_retidos":len(retained),
            "n_ratificados_individualmente":sum(r["ratificado_individualmente_pelo_autor"] for r in registros),
            "n_ia_autorizacao_antecipada":sum(not r["ratificado_individualmente_pelo_autor"] for r in registros),
            "distribuicao_retidos":dict(collections.Counter(r["rotulo_revisado"] for r in retained)),
            "sha256_registros":digest,"apto_como_teste_humano_independente":False,
            "nota":"Mesma rubrica técnica. Anotação assistida tem proveniência mista; não declarar 100 avaliações humanas. Folds e treino final ainda dependem de protocolo e suporte por classe.",
            "registros":registros}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--saida",type=Path,default=BASE/"data/revisao_piloto_v1")
    args = parser.parse_args()
    registro=json.loads((BASE/"validation/revisao_adjudicada.json").read_text(encoding="utf-8"))
    piloto=json.loads((BASE/"data/curriculos_piloto.json").read_text(encoding="utf-8-sig"))
    result=consolidar(registro,piloto,BASE.parent)
    args.saida.mkdir(parents=True,exist_ok=True)
    gravar_json_atomico(args.saida/"manifesto.json",result)
    dest=args.saida/"rotulos.csv"
    tmp=dest.with_name(dest.name+".tmp")
    fields=["id","incluir","rotulo_revisado","tipo_aprovacao","ratificado_individualmente_pelo_autor","grupo_documental","fonte_texto","sha256_texto_utf8_lf","caracteres_texto_integral","papel_experimental"]
    with tmp.open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(result["registros"])
    tmp.replace(dest)
    print(json.dumps({k:v for k,v in result.items() if k!="registros"},ensure_ascii=True))


if __name__=="__main__":
    main()
