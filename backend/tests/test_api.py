"""
test_api.py — Integration tests for the FastAPI endpoints.

Run:  cd backend && pytest tests/ -v --tb=short
"""

import io
import json
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock

# The TestClient import triggers app startup — .env must exist or env vars be set
import os
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-test-key-for-testing")

from main import app

client = TestClient(app)

# ── Fixtures ──────────────────────────────────────────────────────────────────

MOCK_TRANSACTIONS = [
    {
        "date": "01 Jun",
        "description": "Monthly Salary",
        "category": "Salary",
        "amount": 85000.0,
    },
    {
        "date": "03 Jun",
        "description": "Zomato Order",
        "category": "Food",
        "amount": -650.0,
    },
    {
        "date": "05 Jun",
        "description": "Rent Payment",
        "category": "Rent",
        "amount": -25000.0,
    },
]

# Minimal valid PDF bytes — real parsing is tested separately
MINIMAL_PDF_BYTES = b"%PDF-1.4 placeholder"


def make_pdf_upload(content: bytes = MINIMAL_PDF_BYTES, filename: str = "statement.pdf"):
    return ("file", (filename, io.BytesIO(content), "application/pdf"))


# ── Health endpoint ───────────────────────────────────────────────────────────

def test_health_returns_200():
    r = client.get("/health")
    assert r.status_code == 200


def test_health_response_shape():
    r = client.get("/health")
    data = r.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "model" in data


# ── Validation: file type ──────────────────────────────────────────────────────

def test_non_pdf_file_rejected():
    r = client.post(
        "/analyze",
        files=[("file", ("test.txt", io.BytesIO(b"hello world"), "text/plain"))],
    )
    assert r.status_code == 400
    assert "PDF" in r.json()["detail"]


def test_missing_file_rejected():
    r = client.post("/analyze")
    assert r.status_code == 422  # FastAPI validation error


def test_csv_file_rejected():
    r = client.post(
        "/analyze",
        files=[("file", ("data.csv", io.BytesIO(b"date,amount"), "text/csv"))],
    )
    assert r.status_code == 400


# ── Successful analysis ───────────────────────────────────────────────────────

def test_analyze_success_returns_200():
    """Happy path: mock both parser and AI layer."""
    from models import Transaction

    mock_txns = [Transaction(**t) for t in MOCK_TRANSACTIONS]

    with patch("main._parse_bytes", return_value="raw extracted text with transactions"), \
         patch("main.categorize_transactions", new_callable=AsyncMock, return_value=mock_txns):
        r = client.post("/analyze", files=[make_pdf_upload()])

    assert r.status_code == 200


def test_analyze_response_shape():
    from models import Transaction

    mock_txns = [Transaction(**t) for t in MOCK_TRANSACTIONS]

    with patch("main._parse_bytes", return_value="raw text"), \
         patch("main.categorize_transactions", new_callable=AsyncMock, return_value=mock_txns):
        r = client.post("/analyze", files=[make_pdf_upload()])

    data = r.json()
    assert "transactions" in data
    assert "count" in data
    assert "total_credits" in data
    assert "total_debits" in data
    assert "net_cashflow" in data
    assert data["count"] == 3


def test_analyze_totals_computed_correctly():
    from models import Transaction

    mock_txns = [Transaction(**t) for t in MOCK_TRANSACTIONS]

    with patch("main._parse_bytes", return_value="raw text"), \
         patch("main.categorize_transactions", new_callable=AsyncMock, return_value=mock_txns):
        r = client.post("/analyze", files=[make_pdf_upload()])

    data = r.json()
    assert data["total_credits"] == 85000.0
    assert data["total_debits"] == 25650.0
    assert data["net_cashflow"] == pytest.approx(59350.0)


# ── Edge cases ────────────────────────────────────────────────────────────────

def test_empty_pdf_text_returns_422():
    """Parser extracts empty string → 422 with helpful message."""
    with patch("main._parse_bytes", return_value="   "):
        r = client.post("/analyze", files=[make_pdf_upload()])
    assert r.status_code == 422
    assert "text" in r.json()["detail"].lower()


def test_no_transactions_found_returns_422():
    from models import Transaction

    with patch("main._parse_bytes", return_value="some text here"), \
         patch("main.categorize_transactions", new_callable=AsyncMock, return_value=[]):
        r = client.post("/analyze", files=[make_pdf_upload()])
    assert r.status_code == 422


# ── Transaction model ─────────────────────────────────────────────────────────

def test_transaction_amount_rounds_to_2dp():
    from models import Transaction
    t = Transaction(date="01 Jun", description="Test", category="Other", amount=12.999)
    assert t.amount == 13.0


def test_transaction_description_truncated():
    from models import Transaction
    long_desc = "A" * 100
    t = Transaction(date="01 Jun", description=long_desc, category="Other", amount=-10.0)
    assert len(t.description) <= 80


def test_invalid_category_rejected():
    from models import Transaction
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        Transaction(date="01 Jun", description="Test", category="InvalidCat", amount=-10.0)
