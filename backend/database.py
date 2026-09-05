import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib
import secrets
import os
import hmac


BASE_DIR = Path(__file__).resolve().parent
DATABASE_FILE = BASE_DIR / "demandiq.db"


def get_connection():
    connection = sqlite3.connect(
        DATABASE_FILE,
        timeout=30,
    )

    connection.row_factory = sqlite3.Row

    connection.execute(
        "PRAGMA journal_mode=WAL"
    )

    connection.execute(
        "PRAGMA busy_timeout=30000"
    )

    return connection

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)

    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000,
    ).hex()

    return f"{salt}${hashed}"


def verify_password(
    password: str,
    stored_password: str,
) -> bool:
    try:
        salt, saved_hash = stored_password.split("$")

        hashed = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000,
        ).hex()

        return secrets.compare_digest(
            hashed,
            saved_hash,
        )

    except ValueError:
        return False


def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Viewer',
            status TEXT NOT NULL DEFAULT 'Active',
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


def create_default_admin():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT user_id
        FROM users
        WHERE user_id = ?
        """,
        ("USR-1001",),
    )

    existing = cursor.fetchone()

    if existing is None:
        cursor.execute(
            """
            INSERT INTO users (
                user_id,
                name,
                email,
                password_hash,
                role,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "USR-1001",
                "Admin User",
                "admin@demandiq.com",
                hash_password("Admin@123"),
                "Admin",
                "Active",
                datetime.now().isoformat(),
            ),
        )

        connection.commit()

    connection.close()


def initialize_database():
    create_tables()
    create_default_admin()