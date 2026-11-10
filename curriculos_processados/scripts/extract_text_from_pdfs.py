# python -m venv .venv
#.venv\Scripts\activate

from pathlib import Path
import fitz
import pandas as pd
from tqdm import tqdm
import re


INPUT_DIR = Path(r"C:\Users\brenn\Documents\TCC\archive\data\data")
OUTPUT_BASE_DIR = Path(r"C:\Users\brenn\Documents\TCC\curriculos_processados")

OUTPUT_DIR = OUTPUT_BASE_DIR / "extracted_text_en"
LOG_DIR = OUTPUT_BASE_DIR / "logs"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)


def normalize_raw_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = text.replace("Â", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text_from_pdf(pdf_path: Path):
    metadata = {
        "pages": 0,
        "chars": 0,
        "status": "ok",
        "error": "",
    }

    try:
        doc = fitz.open(pdf_path)
        metadata["pages"] = len(doc)

        pages_text = []

        for page_number, page in enumerate(doc, start=1):
            page_text = page.get_text("text") or ""
            pages_text.append(f"\n\n--- PAGE {page_number} ---\n\n{page_text}")

        full_text = normalize_raw_text("\n".join(pages_text))
        metadata["chars"] = len(full_text)

        if len(full_text) < 300:
            metadata["status"] = "warning_low_text"

        return full_text, metadata

    except Exception as e:
        metadata["status"] = "error"
        metadata["error"] = str(e)
        return "", metadata


def main():
    pdf_files = [p for p in INPUT_DIR.glob("*/*") if p.suffix.lower() == ".pdf"]

    if not pdf_files:
        print(f"Nenhum PDF encontrado em: {INPUT_DIR}")
        return

    logs = []

    for pdf_path in tqdm(pdf_files, desc="Extraindo PDFs"):
        area = pdf_path.parent.name.lower()

        output_area_dir = OUTPUT_DIR / area
        output_area_dir.mkdir(parents=True, exist_ok=True)

        output_txt_path = output_area_dir / f"{pdf_path.stem}.txt"

        text, metadata = extract_text_from_pdf(pdf_path)

        if text:
            output_txt_path.write_text(text, encoding="utf-8")

        logs.append({
            "area": area,
            "arquivo_origem": pdf_path.name,
            "caminho_pdf": str(pdf_path),
            "caminho_txt": str(output_txt_path) if text else "",
            "paginas": metadata["pages"],
            "caracteres_extraidos": metadata["chars"],
            "status": metadata["status"],
            "erro": metadata["error"],
        })

    log_df = pd.DataFrame(logs)
    log_path = LOG_DIR / "extraction_log.csv"
    log_df.to_csv(log_path, index=False, encoding="utf-8-sig")

    print("\nExtração finalizada.")
    print(f"PDFs processados: {len(pdf_files)}")
    print(f"Textos salvos em: {OUTPUT_DIR}")
    print(f"Log salvo em: {log_path}")


if __name__ == "__main__":
    main()