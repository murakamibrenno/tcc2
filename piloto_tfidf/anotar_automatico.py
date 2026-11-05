"""
Anotacao automatica por regras lexicas (protocolo_anotacao.md).

Criterios obrigatorios (4):
  SQL | REST/web services | Git | Linguagem de programacao

Classes:
  Adequado = 4/4 (somente information-technology)
  Parcialmente Adequado = 2-3/4 em IT
  Inadequado = outra categoria OU 0-1/4 em IT

Uso como modulo ou:
  python anotar_automatico.py --validar   # compara com piloto manual n=20
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass

SQL_PATTERNS = [
    r"\bsql\b",
    r"\bmysql\b",
    r"\bpostgresql\b",
    r"\boracle\b",
    r"\bsql server\b",
    r"\bpl/sql\b",
    r"\bt-sql\b",
    r"\bmssql\b",
    r"\bmariadb\b",
    r"\brelational database",
]

REST_PATTERNS = [
    r"\brest\b",
    r"\brestful\b",
    r"\brest api\b",
    r"\bweb services?\b",
    r"\bwebservices\b",
    r"\bmicroservices?\b",
    r"\bapi integration\b",
    r"\bsoap\b",
    r"\bwsdl\b",
]

GIT_PATTERNS = [
    r"\bgit\b",
    r"\bgithub\b",
    r"\bgitlab\b",
    r"\bbitbucket\b",
]

LANG_PATTERNS = [
    r"\bjava\b",
    r"\bpython\b",
    r"\bphp\b",
    r"\bc#\b",
    r"\b\.net\b",
    r"\bjavascript\b",
    r"\btypescript\b",
    r"\bspring\b",
    r"\bdrupal\b",
    r"\bnode\.?js\b",
    r"\bruby\b",
    r"\bkotlin\b",
    r"\bgo\b",
    r"\bgolang\b",
    r"\breact\b",
    r"\bangular\b",
    r"\bvue\b",
    r"\bc\+\+\b",
]

# Titulos IT nao-dev -> forcar Inadequado mesmo com SQL
NON_DEV_TITLE = re.compile(
    r"\b(manager|director|vp|vice president|coordinator|consultant|student|"
    r"security|network|mcitp|data manager|master data|sysadmin|technician|"
    r"support specialist|help desk|instructor|teacher)\b",
    re.I,
)


@dataclass
class ResultadoAnotacao:
    sql: bool
    rest: bool
    git: bool
    lang: bool
    total: int
    classe: str
    observacao: str

    def as_dict(self) -> dict:
        return {
            "sql": int(self.sql),
            "rest": int(self.rest),
            "git": int(self.git),
            "lang": int(self.lang),
            "total_requisitos": self.total,
            "classificacao_automatica": self.classe,
            "observacao_auto": self.observacao,
        }


def _match_any(text: str, patterns: list[str]) -> bool:
    return any(re.search(p, text) for p in patterns)


def detectar_criterios(texto: str) -> tuple[bool, bool, bool, bool]:
    t = texto.lower()
    return (
        _match_any(t, SQL_PATTERNS),
        _match_any(t, REST_PATTERNS),
        _match_any(t, GIT_PATTERNS),
        _match_any(t, LANG_PATTERNS),
    )


def classificar(categoria: str, texto: str, titulo: str = "") -> ResultadoAnotacao:
    cat = (categoria or "").strip().lower()
    sql, rest, git, lang = detectar_criterios(texto)
    total = sum([sql, rest, git, lang])
    header = f"{titulo} {texto[:500]}"

    if cat != "information-technology":
        return ResultadoAnotacao(
            sql, rest, git, lang, total, "Inadequado",
            f"NEGATIVO: {cat} (outra area)",
        )

    if total == 4:
        if NON_DEV_TITLE.search(header) and not _match_any(
            header.lower(), [r"\bdeveloper\b", r"\bengineer\b", r"\bprogrammer\b", r"\bsoftware\b"]
        ):
            return ResultadoAnotacao(
                sql, rest, git, lang, total, "Parcialmente Adequado",
                "IT 4/4 mas titulo gestao/infra — rebaixado para Parcial",
            )
        return ResultadoAnotacao(sql, rest, git, lang, total, "Adequado", f"IT 4/4 ({total}/4)")

    if total >= 2:
        return ResultadoAnotacao(
            sql, rest, git, lang, total, "Parcialmente Adequado", f"IT {total}/4"
        )

    return ResultadoAnotacao(sql, rest, git, lang, total, "Inadequado", f"IT {total}/4")


def validar_piloto_manual():
    import csv
    from pathlib import Path

    base = Path(__file__).resolve().parent
    text_base = base.parent / "curriculos_processados" / "cleaned_text_en_readable"
    rows = list(csv.DictReader((base / "data" / "selecao_piloto.csv").open(encoding="utf-8-sig")))
    ok = 0
    print("Validacao auto vs manual (piloto n=20):")
    for row in rows:
        cid = row["id"].strip()
        cat = row["categoria"].strip()
        manual = row["classificacao_confirmada"].strip()
        txt = (text_base / cat / f"{cid}.txt").read_text(encoding="utf-8", errors="ignore")
        auto = classificar(cat, txt, row.get("observacao", ""))
        match = "OK" if auto.classe == manual else "DIFF"
        if auto.classe == manual:
            ok += 1
        print(f"  {cid} manual={manual:25} auto={auto.classe:25} [{match}] {auto.observacao}")
    print(f"\nConcordancia: {ok}/{len(rows)} ({100*ok/len(rows):.0f}%)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--validar", action="store_true")
    args = parser.parse_args()
    if args.validar:
        validar_piloto_manual()


if __name__ == "__main__":
    main()
