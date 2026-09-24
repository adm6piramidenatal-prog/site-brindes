"""Extract the selected first FIVE logo variation from the supplied brand sheet."""

from io import BytesIO
from pathlib import Path

from PIL import Image
import requests


SOURCE_URL = "https://customer-assets-rejwkqb3.emergentagent.net/job_gift-voucher-print/artifacts/e0pxk41a_logo-02.webp"
OUTPUT = Path(__file__).parents[2] / "frontend" / "public" / "brand" / "five-logo.webp"


def main() -> None:
    response = requests.get(SOURCE_URL, timeout=60)
    response.raise_for_status()
    image = Image.open(BytesIO(response.content)).convert("RGBA")
    width, height = image.size
    crop = image.crop((int(width * 0.075), int(height * 0.385), int(width * 0.25), int(height * 0.632)))
    crop.thumbnail((320, 320), Image.Resampling.LANCZOS)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUTPUT, "WEBP", quality=94, method=6)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()