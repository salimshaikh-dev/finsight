"""
main.py — FastAPI application entry point.

Wires together: PDF parser → Claude AI layer → Pydantic validation → HTTP response.
"""

import json
import logging
from contextlib import asynccontextmanager

import anthropic
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ai import categorize_transactions, get_demo_transactions
from config import settings
from models import AnalyzeResponse, HealthResponse
from parser import _parse_bytes

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

MAX_FILE_BYTES = settings.max_file_size_mb * 1024 * 1024


# ── Application lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FinSight API starting up — model: claude-sonnet-4-20250514")
    yield
    logger.info("FinSight API shutting down")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="FinSight — Bank Statement Analyzer",
    description="AI-powered bank statement analysis via Anthropic Claude.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Global error handlers ─────────────────────────────────────────────────────

@app.exception_handler(anthropic.APIConnectionError)
async def anthropic_connection_error(req: Request, exc: anthropic.APIConnectionError):
    logger.error(f"Claude API connection error: {exc}")
    return JSONResponse(
        status_code=502,
        content={"detail": "Could not reach the AI service. Please try again shortly."},
    )


@app.exception_handler(anthropic.RateLimitError)
async def anthropic_rate_limit(req: Request, exc: anthropic.RateLimitError):
    logger.warning("Claude API rate limit hit")
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please wait a moment and retry."},
    )


@app.exception_handler(anthropic.APIStatusError)
async def anthropic_status_error(req: Request, exc: anthropic.APIStatusError):
    logger.error(f"Claude API status error: {exc.status_code} — {exc.message}")
    return JSONResponse(
        status_code=502,
        content={"detail": f"AI service error: {exc.message}"},
    )


@app.exception_handler(json.JSONDecodeError)
async def json_decode_error(req: Request, exc: json.JSONDecodeError):
    logger.error(f"JSON parse error from Claude: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "AI returned a malformed response. Please retry."},
    )


@app.exception_handler(anthropic.BadRequestError)
async def anthropic_insufficient_credits(req: Request, exc: anthropic.BadRequestError):
    """Handle insufficient API credits by offering demo mode."""
    error_msg = str(exc)
    if "credit balance" in error_msg.lower() or "insufficient" in error_msg.lower():
        logger.warning(f"Claude API insufficient credits — using demo mode")
        return JSONResponse(
            status_code=200,
            content={
                "transactions": get_demo_transactions(),
                "count": len(get_demo_transactions()),
                "demo_mode": True,
                "message": "Demo mode active: No API credits. Get free credits at https://console.anthropic.com/account/keys",
            },
        )
    logger.error(f"Claude API bad request: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": f"Invalid API request: {str(exc)[:100]}"},
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    """Liveness probe — used by Railway and monitoring tools."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        model="claude-sonnet-4-20250514",
    )


@app.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
async def analyze(file: UploadFile = File(...)):
    """
    Accept a bank statement PDF and return structured transaction data.

    - Validates file type and size
    - Extracts text with pdfplumber (tables + raw text dual-pass)
    - Sends to Claude for categorization
    - Returns Pydantic-validated JSON
    """

    # ── Validation ────────────────────────────────────────────────────────────
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Read once, check size
    contents = await file.read()
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.max_file_size_mb}MB.",
        )

    logger.info(f"Received: {file.filename!r} ({len(contents) / 1024:.1f} KB)")

    # ── Extraction ────────────────────────────────────────────────────────────
    raw_text = _parse_bytes(contents)

    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract text from this PDF. "
                "It may be a scanned/image-based file. "
                "Please upload a text-based PDF."
            ),
        )

    # ── AI Categorisation ─────────────────────────────────────────────────────
    try:
        transactions = await categorize_transactions(raw_text)
    except anthropic.BadRequestError as e:
        # Handle insufficient credits by using demo mode
        error_msg = str(e)
        if "credit balance" in error_msg.lower() or "insufficient" in error_msg.lower():
            logger.warning("Insufficient Claude API credits — using demo mode")
            transactions = get_demo_transactions()
        else:
            raise

    if not transactions:
        raise HTTPException(
            status_code=422,
            detail="No transactions found in this document. Please verify it is a bank statement.",
        )

    logger.info(f"Returning {len(transactions)} transactions for {file.filename!r}")

    return AnalyzeResponse(transactions=transactions, count=len(transactions))
