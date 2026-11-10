from pathlib import Path
import re
from tqdm import tqdm
from ftfy import fix_text


INPUT_DIR = Path(r"C:\Users\brenn\Documents\TCC\curriculos_processados\extracted_text_en")
OUTPUT_DIR = Path(r"C:\Users\brenn\Documents\TCC\curriculos_processados\cleaned_text_en_readable")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


SECTION_TITLES = [
    "Summary",
    "Highlights",
    "Skills",
    "Experience",
    "Education",
    "Accomplishments",
    "Certifications",
    "Interests",
    "Additional Information",
    "Professional Summary",
    "Work Experience",
    "Core Qualifications",
]


def protect_section_titles(text: str) -> str:
    """
    Garante que títulos de seção fiquem em linhas separadas.
    """
    for title in SECTION_TITLES:
        pattern = rf"\b{re.escape(title)}\b"
        text = re.sub(pattern, f"\n\n{title}\n", text, flags=re.IGNORECASE)

    return text


def clean_text_readable(text: str) -> str:
    text = fix_text(text)

    text = text.replace("\x00", " ")
    text = text.replace("Â", "")

    # Corrige palavras quebradas por hífen no fim da linha
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)

    # Normaliza espaços em cada linha, sem destruir parágrafos
    lines = []
    for line in text.splitlines():
        line = re.sub(r"[ \t]+", " ", line)
        line = line.strip()
        lines.append(line)

    text = "\n".join(lines)

    # Protege títulos de seção
    text = protect_section_titles(text)

    # Remove linhas vazias excessivas
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Corrige espaços antes de pontuação
    text = re.sub(r"\s+([,.;:])", r"\1", text)

    return text.strip()


def main():
    txt_files = list(INPUT_DIR.glob("*/*.txt"))

    print(f"Arquivos encontrados: {len(txt_files)}")

    for txt_path in tqdm(txt_files, desc="Gerando versão readable"):
        area = txt_path.parent.name

        output_area = OUTPUT_DIR / area
        output_area.mkdir(parents=True, exist_ok=True)

        output_path = output_area / txt_path.name

        text = txt_path.read_text(encoding="utf-8", errors="ignore")
        cleaned = clean_text_readable(text)

        output_path.write_text(cleaned, encoding="utf-8")

    print("\nLimpeza readable concluída.")
    print(f"Arquivos salvos em: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()