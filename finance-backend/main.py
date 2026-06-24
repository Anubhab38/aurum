import csv
import io
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import transactions
from llm import categorize_transaction, generate_insights
from auth import ClerkAuth

app = FastAPI(title="AI Expense Tracker")

# Rate Limiter setup
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow the Vite dev server and the deployed Vercel frontend to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://aurum-omega-one.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionIn(BaseModel):
    amount: float
    description: str
    date: str          # "YYYY-MM-DD"
    type: str           # "expense" or "income"
    category: Optional[str] = None  # usually left blank; the LLM fills this in


def serialize_transaction(doc: dict) -> dict:
    """MongoDB's ObjectId isn't JSON-serializable by default, so convert it
    to a plain string before this document goes back to the frontend."""
    doc["_id"] = str(doc["_id"])
    return doc


@app.post("/transactions")
@limiter.limit("30/minute")
def create_transaction(
    request: Request,
    transaction: TransactionIn,
    userId: str = Depends(ClerkAuth())
):
    if transaction.type not in ("expense", "income"):
        raise HTTPException(status_code=400, detail="type must be 'expense' or 'income'")

    category = transaction.category
    if not category:
        category = categorize_transaction(transaction.description) if transaction.type == "expense" else "Other"

    # Save transaction associated with the authenticated User ID
    doc = {
        "userId": userId,
        "amount": transaction.amount,
        "description": transaction.description,
        "category": category,
        "date": transaction.date,
        "type": transaction.type,
        "createdAt": datetime.now(timezone.utc),
    }

    result = transactions.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_transaction(doc)


@app.get("/transactions")
@limiter.limit("100/minute")
def list_transactions(
    request: Request,
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    userId: str = Depends(ClerkAuth())
):
    # Retrieve only transactions belonging to the authenticated user
    query = {"userId": userId}
    
    if start or end:
        date_filter = {}
        if start:
            date_filter["$gte"] = start
        if end:
            date_filter["$lte"] = end
        query["date"] = date_filter

    docs = list(transactions.find(query).sort("date", -1))
    return [serialize_transaction(doc) for doc in docs]


@app.post("/transactions/upload")
@limiter.limit("10/minute")
async def upload_transactions(
    request: Request,
    file: UploadFile = File(...),
    userId: str = Depends(ClerkAuth())
):
    raw_bytes = await file.read()
    text = raw_bytes.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    required_columns = {"date", "amount", "description", "type"}
    if not required_columns.issubset(set(reader.fieldnames or [])):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must have columns: {', '.join(required_columns)}",
        )

    inserted_docs = []
    for row in reader:
        try:
            tx_type = row["type"].strip().lower()
            category = categorize_transaction(row["description"]) if tx_type == "expense" else "Other"
            
            # Save transaction associated with the authenticated User ID
            doc = {
                "userId": userId,
                "amount": float(row["amount"]),
                "description": row["description"],
                "category": category,
                "date": row["date"].strip(),
                "type": tx_type,
                "createdAt": datetime.now(timezone.utc),
            }
            result = transactions.insert_one(doc)
            doc["_id"] = result.inserted_id
            inserted_docs.append(serialize_transaction(doc))
        except (ValueError, KeyError):
            # Skip malformed rows rather than failing the whole upload.
            continue

    return {"inserted_count": len(inserted_docs), "transactions": inserted_docs}


def get_summary_for_user(userId: str) -> dict:
    """
    Helper function to aggregate analytics data for a specific user.
    Called by both analytics_summary and analytics_insights.
    """
    by_category_pipeline = [
        {"$match": {"userId": userId, "type": "expense"}},
        {"$group": {
            "_id": "$category",
            "total": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"total": -1}},
    ]
    by_category_raw = list(transactions.aggregate(by_category_pipeline))
    by_category = [
        {"category": row["_id"], "total": round(row["total"], 2), "count": row["count"]}
        for row in by_category_raw
    ]

    by_month_pipeline = [
        {"$match": {"userId": userId, "type": "expense"}},
        {"$project": {
            "amount": 1,
            "month": {"$substrCP": ["$date", 0, 7]},
        }},
        {"$group": {
            "_id": "$month",
            "total": {"$sum": "$amount"},
        }},
        {"$sort": {"_id": 1}},
    ]
    by_month_raw = list(transactions.aggregate(by_month_pipeline))
    by_month = [
        {"month": row["_id"], "total": round(row["total"], 2)}
        for row in by_month_raw
    ]

    return {"by_category": by_category, "by_month": by_month}


@app.get("/analytics/summary")
@limiter.limit("100/minute")
def analytics_summary(request: Request, userId: str = Depends(ClerkAuth())):
    return get_summary_for_user(userId)


@app.post("/analytics/insights")
@limiter.limit("5/minute")
def analytics_insights(request: Request, userId: str = Depends(ClerkAuth())):
    summary = get_summary_for_user(userId)

    if not summary["by_category"]:
        return {
            "insight": "No expenses logged yet — add a few transactions to see your spending insights here."
        }

    top_category = summary["by_category"][0]["category"]
    top_amount = summary["by_category"][0]["total"]

    total_spend = sum(
        item["total"] for item in summary["by_category"]
    )

    facts = {
        "top_category": top_category,
        "top_amount": top_amount,
        "total_spend": total_spend,
        "category_breakdown": summary["by_category"],
        "monthly_breakdown": summary["by_month"],
    }

    insight_text = generate_insights(facts)
    return {"insight": insight_text}


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Expense Tracker API is running"}
