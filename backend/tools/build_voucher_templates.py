"""Build faithful SVG backgrounds from the five user-provided PDF templates.

The source PDF is kept intact except for variable values (old winner name and
issue date). The 3-diarias title/value are also cleared because those values
change with the selected business rule. Text is exported as vector paths so
the browser and printer do not substitute the PDF's original fonts.
"""

from pathlib import Path

import pymupdf
import requests


OUTPUT_DIR = Path(__file__).parents[2] / "frontend" / "public" / "templates"

TEMPLATES = [
    {
        "output": "barraca-praia.svg",
        "url": "https://customer-assets-rejwkqb3.emergentagent.net/job_gift-voucher-print/artifacts/fryt1b1g_BARRACA%20DE%20PRAIA.pdf",
        "values": ["MATHEUS VICENTI|KETHELLEN ARAUJO", "21/09/2026", "MANUAL"],
    },
    {
        "output": "day-use.svg",
        "url": "https://customer-assets-rejwkqb3.emergentagent.net/job_gift-voucher-print/artifacts/knk2n32n_DAY%20USE%20-%20MANUAL.pdf",
        "values": ["EULER DANIEL | SCHIMABUKURO", "15/09/2026", "MANUAL"],
    },
    {
        "output": "passeios.svg",
        "url": "https://customer-assets-rejwkqb3.emergentagent.net/job_gift-voucher-print/artifacts/pflgmmh3_DESCONTO%20EM%20PASSEIOS.pdf",
        "values": ["EULER DANIEL | SCHIMABUKURO", "15/09/2026", "MANUAL"],
    },
    {
        "output": "day-use-vip.svg",
        "url": "https://customer-assets-rejwkqb3.emergentagent.net/job_gift-voucher-print/artifacts/3l2ut1hz_DAY%20USE%20VIP%20-%20MANUAL.pdf",
        "values": ["PAULO ROBERTO CARVALHO LIRA", "22/09/2026", "MANUAL"],
    },
    {
        "output": "diarias.svg",
        "url": "https://customer-assets-rejwkqb3.emergentagent.net/job_gift-voucher-print/artifacts/zyfe6mf0_3%20DIARIAS%20-%20COM%20CUSTO.pdf",
        "values": [
            "LORRANE MEDLEY SANTOS INÁCIO",
            "22/09/2026",
            "TÍTULO DE RESERVA - 3 DIÁRIAS",
            "VALOR PROMOCIONAL: R$ 600,00",
            "NÚMERO DO TÍTULO",
        ],
    },
]


def should_clear(text: str, values: list[str]) -> bool:
    normalized = " ".join(text.split()).strip()
    return any(value in normalized for value in values)


def build_template(template: dict) -> None:
    response = requests.get(template["url"], timeout=60)
    response.raise_for_status()
    document = pymupdf.open(stream=response.content, filetype="pdf")
    if len(document) != 1:
        raise RuntimeError(f"Expected one page in {template['output']}, got {len(document)}")
    page = document[0]

    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                if should_clear(span["text"], template["values"]):
                    rect = pymupdf.Rect(span["bbox"])
                    rect.x0 -= 0.8
                    rect.y0 -= 0.8
                    rect.x1 += 1.2
                    rect.y1 += 0.8
                    page.add_redact_annot(rect, fill=(1, 1, 1), cross_out=False)

    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    svg = page.get_svg_image(text_as_path=True)
    destination = OUTPUT_DIR / template["output"]
    destination.write_text(svg, encoding="utf-8")
    print(f"Wrote {destination.name}")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for template in TEMPLATES:
        build_template(template)


if __name__ == "__main__":
    main()