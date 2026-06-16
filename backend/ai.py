"""
ai.py — Anthropic Claude integration.

The prompt here is the result of 5 iterations described in the blueprint.
Every design decision is commented so you can explain it in an interview.
"""

import json
import re
import logging
from models import Transaction
from config import settings
import anthropic

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

# ── Model constant ────────────────────────────────────────────────────────────
MODEL = "claude-sonnet-4-20250514"

# ── System prompt ─────────────────────────────────────────────────────────────
# Placed in the system turn so it primes Claude's role before any user content.
# "ONLY return" + "NEVER add" is deliberate redundancy — belt AND braces.
SYSTEM_PROMPT = """You are a financial data extraction engine.
You extract bank transactions from raw statement text and return structured JSON.
You NEVER add commentary, markdown, code fences, or explanation.
You ONLY return a valid JSON array of transaction objects.
If you cannot find any transactions, return an empty array: []"""

# ── User prompt template ──────────────────────────────────────────────────────
# Iteration history:
# v1: No system msg → Claude added ```json fences → json.loads() crashed
#     Fix: Moved role to system prompt, added "No markdown, no backticks"
# v2: Amounts inconsistent ("£1,200.00" vs "-1200")
#     Fix: "POSITIVE for credits, NEGATIVE for debits. Plain number. No symbols."
# v3: Everything categorised as "Other" — category list too vague
#     Fix: Added explicit keyword examples per category
# v4: Long statements (50+ pages) exceeded token window
#     Fix: [:12000] slice — interview note: production would chunk per page
# v5: Rare non-JSON preamble on ambiguous statements
#     Fix: System prompt now says ONLY and NEVER; regex strip as fallback
USER_PROMPT_TEMPLATE = """Extract every transaction from this bank statement text.

Return ONLY a JSON array. No markdown. No explanation. No backticks. No preamble.

Each object in the array must have EXACTLY these fields:
  "date"        — string, original date format from the statement (e.g. "14 Jun", "2025-06-14", "14/06/25")
  "description" — string, merchant name or transaction description, max 80 characters
  "category"    — string, MUST be one of the values listed below
  "amount"      — number, POSITIVE for money coming IN (credits/deposits), NEGATIVE for money going OUT (debits/payments). Plain number. No currency symbols. No commas.

Category values and when to use them:
  "Salary"        — payroll, salary, wages, BACS credit, freelance invoice payment, stipend
  "Rent"          — rent, lease, landlord, letting agent, housing payment, PG payment
  "Food"          — grocery, supermarket, restaurant, cafe, takeaway, food delivery (Zomato, Swiggy, etc.)
  "Software"      — SaaS subscription, API service, cloud (AWS, GCP, Azure), app store, developer tool
  "Transport"     — Uber, Ola, cab, metro, bus, fuel, petrol, parking, toll, auto
  "Utilities"     — electricity, water, gas, broadband, mobile recharge, phone bill, council tax
  "Healthcare"    — pharmacy, hospital, doctor, clinic, medicine, health insurance
  "Entertainment" — Netflix, Spotify, cinema, OTT, gaming, concert, sports
  "Transfers"     — bank transfer, NEFT, IMPS, UPI to person, self-transfer between accounts
  "Other"         — anything that does not clearly fit the above categories

Bank statement text:
{statement_text}"""


async def categorize_transactions(text: str) -> list[Transaction]:
    """
    Send extracted PDF text to Claude and parse the returned JSON into
    validated Transaction objects.

    Raises:
        json.JSONDecodeError   — if Claude returns non-parseable output
        anthropic.APIError     — if the API call fails
        ValueError             — if parsed data doesn't match the Transaction schema
    """
    # Truncate to ~12,000 chars to stay comfortably within token budget.
    # Production improvement: chunk by page and merge results.
    truncated_text = text[:12_000]

    logger.info(f"Sending {len(truncated_text)} chars to Claude ({MODEL})")

    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": USER_PROMPT_TEMPLATE.format(statement_text=truncated_text),
            }
        ],
    )

    raw = response.content[0].text.strip()
    logger.info(f"Claude response length: {len(raw)} chars")

    # Defensive strip: remove any accidental markdown fences
    # Even with explicit instructions, occasional edge cases slip through.
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    # Parse JSON
    data: list[dict] = json.loads(raw)

    if not isinstance(data, list):
        raise ValueError(f"Expected JSON array, got {type(data).__name__}")

    # Validate each transaction through Pydantic
    transactions: list[Transaction] = []
    for i, item in enumerate(data):
        try:
            transactions.append(Transaction(**item))
        except Exception as e:
            logger.warning(f"Skipping invalid transaction at index {i}: {e} — data: {item}")
            # Skip malformed individual entries rather than failing the whole request

    logger.info(f"Successfully parsed {len(transactions)} transactions")
    return transactions


# ── Demo mode for testing without API credits ─────────────────────────────────
DEMO_TRANSACTIONS = [
    Transaction(
        date="01 Jun",
        description="Salary - June 2025",
        category="Salary",
        amount=5000.00,
    ),
    Transaction(
        date="02 Jun",
        description="Flat rent payment",
        category="Rent",
        amount=-1200.00,
    ),
    Transaction(
        date="03 Jun",
        description="Tesco Supermarket",
        category="Food",
        amount=-45.32,
    ),
    Transaction(
        date="04 Jun",
        description="AWS subscription",
        category="Software",
        amount=-29.99,
    ),
    Transaction(
        date="05 Jun",
        description="Uber ride to office",
        category="Transport",
        amount=-12.50,
    ),
    Transaction(
        date="06 Jun",
        description="Electricity bill",
        category="Utilities",
        amount=-65.00,
    ),
    Transaction(
        date="07 Jun",
        description="Pharmacy - vitamins",
        category="Healthcare",
        amount=-24.99,
    ),
    Transaction(
        date="08 Jun",
        description="Netflix subscription",
        category="Entertainment",
        amount=-15.99,
    ),
    Transaction(
        date="09 Jun",
        description="Transfer to savings account",
        category="Transfers",
        amount=-500.00,
    ),
    Transaction(
        date="10 Jun",
        description="Coffee at Starbucks",
        category="Other",
        amount=-5.50,
    ),
    Transaction(
        date="11 Jun",
        description="Freelance payment received",
        category="Salary",
        amount=800.00,
    ),
    Transaction(
        date="12 Jun",
        description="Grocery shopping",
        category="Food",
        amount=-72.15,
    ),
]


def get_demo_transactions() -> list[Transaction]:
    """
    Return sample transactions for testing without Anthropic API credits.
    Demonstrates all 10 transaction categories.
    """
    logger.info(f"Using DEMO MODE — returning {len(DEMO_TRANSACTIONS)} sample transactions")
    return DEMO_TRANSACTIONS
