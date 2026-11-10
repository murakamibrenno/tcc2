from pathlib import Path
import pandas as pd


BASE_DIR = Path(r"C:\Users\brenn\Documents\TCC\curriculos_processados")

RAW_DIR = BASE_DIR / "extracted_text_en"
READABLE_DIR = BASE_DIR / "cleaned_text_en_readable"
MODEL_DIR = BASE_DIR / "cleaned_text_en"
LOG_DIR = BASE_DIR / "logs"

LOG_DIR.mkdir(parents=True, exist_ok=True)


EXPERIENCE_ALIASES = [
    "Experience",
    "Work Experience",
    "Professional Experience",
    "Employment History",
    "Work History",
    "Career History",
    "Professional Background",
]

EDUCATION_ALIASES = [
    "Education",
    "Academic Background",
    "Academic History",
    "Educational Background",
    "Qualifications",
    "Certifications",
]

SKILLS_ALIASES = [
    "Skills",
    "Technical Skills",
    "Core Qualifications",
    "Core Competencies",
    "Competencies",
    "Highlights",
    "Areas of Expertise",
]


def read_file(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="ignore")


def contains_any(text: str, aliases: list[str]) -> bool:
    text_lower = text.lower()
    return any(alias.lower() in text_lower for alias in aliases)


def validate(raw: str, readable: str, model: str):
    alertas = []

    if len(raw) == 0:
        alertas.append("raw_vazio")

    if len(readable) == 0:
        alertas.append("readable_vazio")

    if len(model) == 0:
        alertas.append("model_vazio")

    if raw and len(readable) < len(raw) * 0.5:
        alertas.append("readable_muito_menor_que_raw")

    if raw and len(model) < len(raw) * 0.5:
        alertas.append("model_muito_menor_que_raw")

    if readable and not contains_any(readable, EXPERIENCE_ALIASES):
        alertas.append("sem_secao_experiencia")

    if readable and not contains_any(readable, EDUCATION_ALIASES):
        alertas.append("sem_secao_educacao")

    if readable and not contains_any(readable, SKILLS_ALIASES):
        alertas.append("sem_secao_habilidades")

    status = "ok" if not alertas else "alerta"

    return status, "; ".join(alertas)


def main():
    raw_files = list(RAW_DIR.glob("*/*.txt"))

    rows = []

    for raw_path in raw_files:
        area = raw_path.parent.name
        file_name = raw_path.name

        readable_path = READABLE_DIR / area / file_name
        model_path = MODEL_DIR / area / file_name

        raw = read_file(raw_path)
        readable = read_file(readable_path)
        model = read_file(model_path)

        status, alertas = validate(raw, readable, model)

        rows.append({
            "area": area,
            "arquivo": file_name,
            "caracteres_bruto": len(raw),
            "caracteres_readable": len(readable),
            "caracteres_model": len(model),
            "linhas_bruto": raw.count("\n") + 1 if raw else 0,
            "linhas_readable": readable.count("\n") + 1 if readable else 0,
            "linhas_model": model.count("\n") + 1 if model else 0,
            "tem_experiencia": contains_any(readable, EXPERIENCE_ALIASES),
            "tem_educacao": contains_any(readable, EDUCATION_ALIASES),
            "tem_habilidades": contains_any(readable, SKILLS_ALIASES),
            "status_validacao": status,
            "alertas": alertas,
        })

    df = pd.DataFrame(rows)

    output_path = LOG_DIR / "cleaning_validation_log.csv"
    df.to_csv(output_path, index=False, encoding="utf-8-sig")

    print("Validação concluída.")
    print(f"Total de arquivos: {len(df)}")
    print("\nStatus:")
    print(df["status_validacao"].value_counts())

    print("\nExperiência:")
    print(df["tem_experiencia"].value_counts())

    print("\nEducação:")
    print(df["tem_educacao"].value_counts())

    print("\nHabilidades:")
    print(df["tem_habilidades"].value_counts())

    print(f"\nLog salvo em: {output_path}")


if __name__ == "__main__":
    main()