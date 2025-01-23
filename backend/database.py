import sqlite3
from sqlite3 import Connection
import json
from typing import Optional
from pathlib import Path
from contextlib import contextmanager
from passlib.hash import bcrypt

DATABASE_PATH = Path("data/playlists.db")

def dict_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}

def adapt_dict(d):
    return json.dumps(d)

def convert_dict(s):
    return json.loads(s)

# Registra gli adattatori per JSON
sqlite3.register_adapter(dict, adapt_dict)
sqlite3.register_converter("JSON", convert_dict)

@contextmanager
def get_db() -> Connection:
    """Create a database connection and return it"""
    DATABASE_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(
        str(DATABASE_PATH), 
        detect_types=sqlite3.PARSE_DECLTYPES,
        timeout=30.0,  # Aumenta il timeout a 30 secondi
        isolation_level=None  # Abilita la modalità autocommit
    )
    conn.row_factory = dict_factory
    
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    """Initialize the database with required tables"""
    with get_db() as conn:
        cursor = conn.cursor()

        # Enable WAL mode for better concurrency
        cursor.execute('PRAGMA journal_mode=WAL')
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create playlists table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                url TEXT,
                is_custom BOOLEAN DEFAULT FALSE,
                public_token TEXT UNIQUE,
                epg_url TEXT,
                last_sync TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        # Create channels table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                group_title TEXT,
                logo_url TEXT,
                tvg_id TEXT,
                position INTEGER,
                extra_tags JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
            )
        """)

        # Create custom_playlist_channels table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS custom_playlist_channels (
                playlist_id INTEGER NOT NULL,
                channel_id INTEGER NOT NULL,
                position INTEGER,
                PRIMARY KEY (playlist_id, channel_id),
                FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
                FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE
            )
        """)

        # Insert default admin user if it doesn't exist
        cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
        if not cursor.fetchone():
            password_hash = bcrypt.hash("admin")
            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                ("admin", password_hash)
            )

def verify_password(username: str, password: str) -> bool:
    """Verify user password"""
    with get_db() as conn:
        cursor = conn.cursor()
        user = cursor.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,)
        ).fetchone()
        
        if user and bcrypt.verify(password, user['password_hash']):
            return True
        return False

if __name__ == "__main__":
    init_db()
