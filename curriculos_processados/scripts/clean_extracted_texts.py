from pathlib import Path
import re
from tqdm import tqdm
from ftfy import fix_text


INPUT_DIR = Path(r"C:\Users\brenn\Documents\TCC\curriculos_processados\extracted_text_en")
OUTPUT_DIR = Path(r"C:\Users\brenn\Documents\TCC\curriculos_processados\cleaned_text_en")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def clean_text(text: str) -> str:
    # Corrige encoding
    text = fix_text(text)

    # Remove caracteres estranhos
    text = text.replace("\x00", " ")
    text = text.replace("Â", "")

    # Corrige hifenização quebrada
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)

    # Junta palavras separadas incorretamente por quebra
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)

    # Remove múltiplos espaços
    text = re.sub(r"[ \t]+", " ", text)

    # Remove muitas linhas vazias
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Remove espaços no início/fim
    text = text.strip()

    return text


def main():
    txt_files = list(INPUT_DIR.glob("*/*.txt"))

    print(f"Arquivos encontrados: {len(txt_files)}")

    for txt_path in tqdm(txt_files, desc="Limpando textos"):
        area = txt_path.parent.name

        output_area = OUTPUT_DIR / area
        output_area.mkdir(parents=True, exist_ok=True)

        output_path = output_area / txt_path.name

        text = txt_path.read_text(encoding="utf-8", errors="ignore")

        cleaned = clean_text(text)

        output_path.write_text(cleaned, encoding="utf-8")

    print("\nLimpeza concluída.")


if __name__ == "__main__":
    main()