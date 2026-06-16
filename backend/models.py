from pydantic import BaseModel, field_validator, model_validator
from typing import Literal, Optional
from decimal import Decimal

# Strict category literals — must match frontend CategoryBadge map
Category = Literal[
    "Salary",
    "Rent",
    "Food",
    "Software",
    "Transport",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Transfers",
    "Other",
]


class Transaction(BaseModel):
    date: str
    description: str
    category: Category
    amount: float  # positive = credit, negative = debit

    @field_validator("amount")
    @classmethod
    def round_amount(cls, v: float) -> float:
        return round(float(v), 2)

    @field_validator("description")
    @classmethod
    def truncate_description(cls, v: str) -> str:
        return v.strip()[:80]

    @field_validator("date")
    @classmethod
    def clean_date(cls, v: str) -> str:
        return v.strip()[:20]


class AnalyzeResponse(BaseModel):
    transactions: list[Transaction]
    count: int
    total_credits: float = 0.0
    total_debits: float = 0.0
    net_cashflow: float = 0.0
    currency: str = "GBP"
    statement_period: Optional[str] = None

    @model_validator(mode="after")
    def compute_totals(self) -> "AnalyzeResponse":
        self.total_credits = round(
            sum(t.amount for t in self.transactions if t.amount > 0), 2
        )
        self.total_debits = round(
            abs(sum(t.amount for t in self.transactions if t.amount < 0)), 2
        )
        self.net_cashflow = round(self.total_credits - self.total_debits, 2)
        return self


class HealthResponse(BaseModel):
    status: str
    version: str
    model: str
