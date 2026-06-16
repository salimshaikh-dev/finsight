"""
test_parser.py — Unit tests for PDF text extraction.

These tests verify the parser module in isolation, without needing
a real bank statement PDF. A minimal valid PDF is constructed in-memory.
"""

import io
import pytest


def test_parse_bytes_with_empty_input():
    """A near-empty PDF should return minimal/empty text without crashing."""
    from parser import _parse_bytes

    # This is the minimal valid PDF structure
    minimal_pdf = b"""%PDF-1.4
1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj
2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj
3 0 obj<</Type /Page /Parent 2 0 R /MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
trailer<</Size 4 /Root 1 0 R>>
startxref
178
%%EOF"""

    result = _parse_bytes(minimal_pdf)
    assert isinstance(result, str)


def test_parse_bytes_returns_string():
    """Parser must always return a string, never raise on valid PDF bytes."""
    from parser import _parse_bytes
    import pdfplumber

    # Build a real PDF with text using reportlab if available, else skip
    pytest.importorskip("reportlab", reason="reportlab not installed — skipping PDF generation test")

    from reportlab.pdfgen import canvas as rl_canvas
    buf = io.BytesIO()
    c = rl_canvas.Canvas(buf)
    c.drawString(72, 720, "01 Jun  SALARY PAYMENT   +4200.00")
    c.drawString(72, 700, "03 Jun  TESCO METRO       -45.50")
    c.save()
    buf.seek(0)

    result = _parse_bytes(buf.read())
    assert isinstance(result, str)
    assert len(result) > 0
