import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"

CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
]


def _call_groq(messages: list[dict], max_tokens: int) -> str:
    """
    Sends a chat completion request to Groq and returns the response text.
    """

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }

    response = requests.post(
        GROQ_URL,
        headers=headers,
        json=body,
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    return data["choices"][0]["message"]["content"].strip()


def categorize_transaction(description: str) -> str:
    """
    Uses Groq to classify an expense into one of the predefined categories.
    """

    prompt = (
        "Classify the following expense description into exactly one of these "
        f"categories: {', '.join(CATEGORIES)}.\n\n"
        f'Description: "{description}"\n\n'
        "Reply with ONLY the category name, exactly as written above. "
        "No punctuation, no explanation, nothing else."
    )

    try:
        raw_reply = _call_groq(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=10,
        )

    except Exception as e:
        print("Groq Categorization Error:", e)
        return "Other"

    cleaned = raw_reply.strip().strip(".")

    for category in CATEGORIES:
        if cleaned.lower() == category.lower():
            return category

    return "Other"


def generate_insights(summary: dict) -> str:
    """
    Generates concise financial insights from already-computed facts.
    """

    prompt = f"""
All monetary values are in Indian Rupees (INR ₹).

Financial Facts:

{summary}

Instructions:

- Mention only facts provided.
- Do NOT guess reasons for spending.
- Do NOT speculate.
- Do NOT invent trends.
- Mention the highest spending category.
- Mention total spending.
- Give one practical saving suggestion.
- Keep the response under 4 sentences.
- Use ₹ when mentioning amounts.
"""

    try:
        return _call_groq(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=200,
        )

    except Exception as error:
        print("Groq Insight Error:", error)

        return (
            "Couldn't generate insights right now "
            f"(AI service error: {error})"
        )


if __name__ == "__main__":
    print("API Key Loaded:", bool(GROQ_API_KEY))

    print(
        categorize_transaction("Swiggy Order")
    )

    print(
        categorize_transaction("Uber Ride")
    )

    print(
        categorize_transaction("Netflix Subscription")
    )