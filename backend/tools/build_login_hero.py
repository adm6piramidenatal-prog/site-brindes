"""Extract the aerial Hotel Pirâmide / sea photograph from the Diárias PDF."""

from io import BytesIO
from pathlib import Path

import pymupdf
from PIL import Image, ImageEnhance
import requests


SOURCE_URL = "https://customer-assets-rejwkqb3.emergentagent.net/job_gift-voucher-print/artifacts/zyfe6mf0_3%20DIARIAS%20-%20COM%20CUSTO.pdf"
OUTPUT = Path(__file__).parents[2] / "frontend" / "public" / "brand" / "five-login-sea.webp"


def main() -> None:
    response = requests.get(SOURCE_URL, timeout=60)
    response.raise_for_status()
    document = pymupdf.open(stream=response.content, filetype="pdf")
    page = document[0]
    candidates = []
    for image_info in page.get_images(full=True):
        extracted = document.extract_image(image_info[0])
        width = extracted["width"]
        height = extracted["height"]
        if width > height:
            candidates.append((width * height, extracted["image"]))
    if not candidates:
        raise RuntimeError("No landscape image found in the Diárias PDF")
    image = Image.open(BytesIO(max(candidates, key=lambda item: item[0])[1])).convert("RGB")
    image = ImageEnhance.Color(image).enhance(1.08)
    image = ImageEnhance.Contrast(image).enhance(1.06)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, "WEBP", quality=92, method=6)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()