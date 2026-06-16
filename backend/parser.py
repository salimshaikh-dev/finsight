"""
parser.py — PDF text extraction via pdfplumber.

Strategy:
1. Try table extraction first — most bank PDFs embed structured tables.
2. Fall back to raw text extraction with tight tolerances.
3. Combine both, deduplicate, and return a clean string.

This two-pass approach handles the widest variety of bank statement formats:
HDFC, ICICI, SBI, Barclays, HSBC, Chase, etc.
"""

import io
import logging
import pdfplumber
from fastapi import UploadFile

logger = logging.getLogger(__name__)


async def extract_text(file: UploadFile) -> str:
    """
    Extract all readable text from a PDF upload.
    Returns a single string with page breaks preserved.
    """
    contents = await file.read()
    return _parse_bytes(contents)


def _parse_bytes(pdf_bytes: bytes) -> str:
    """
    Core extraction — accepts raw bytes so it's easily testable
    without an HTTP context.
    """
    text_parts: list[str] = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        logger.info(f"Parsing PDF: {len(pdf.pages)} pages")

        for page_num, page in enumerate(pdf.pages, start=1):
            page_text: list[str] = []

            # ── Pass 1: Structured table extraction ──────────────────────
            try:
                tables = page.extract_tables(
                    table_settings={
                        "vertical_strategy": "lines",
                        "horizontal_strategy": "lines",
                        "snap_tolerance": 3,
                    }
                )
                for table in tables or []:
                    for row in table:
                        if row:
                            clean_row = " | ".join(
                                str(cell).strip() if cell else ""
                                for cell in row
                            )
                            if clean_row.strip(" |"):
                                page_text.append(clean_row)
            except Exception as e:
                logger.warning(f"Table extraction failed on page {page_num}: {e}")

            # ── Pass 2: Raw text extraction ───────────────────────────────
            try:
                raw = page.extract_text(
                    x_tolerance=3,
                    y_tolerance=3,
                    layout=True,
                )
                if raw:
                    page_text.append(raw)
            except Exception as e:
                logger.warning(f"Raw text extraction failed on page {page_num}: {e}")

            if page_text:
                text_parts.append(f"--- PAGE {page_num} ---\n" + "\n".join(page_text))

    combined = "\n\n".join(text_parts)
    logger.info(f"Extracted {len(combined)} characters from PDF")
    return combined
