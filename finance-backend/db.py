"""
db.py — single place that owns the MongoDB connection.

Why a separate file: main.py imports `db` (the collection object) instead of
creating a new MongoClient on every request. PyMongo's MongoClient already
manages a connection pool internally, so we just need ONE client for the
whole app's lifetime, created once at import time.
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()  # reads the .env file in this folder and loads it into os.environ

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "expense_tracker")

# One client for the whole app. PyMongo handles pooling/reconnection internally.
client = MongoClient(MONGO_URI)
database = client[MONGO_DB_NAME]

# The single collection this whole project uses, per the spec.
transactions = database["transactions"]

from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

client = MongoClient(MONGO_URI)

try:
    client.admin.command("ping")
    print("✅ MongoDB Atlas Connected")
except Exception as e:
    print("❌ MongoDB Connection Failed")
    print(e)

database = client[MONGO_DB_NAME]
transactions = database["transactions"]