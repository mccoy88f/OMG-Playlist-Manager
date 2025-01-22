import sqlite3
from sqlite3 import Connection
import json
from typing import Optional
from pathlib import Path
from contextlib import contextmanager

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
        
        # Create playlists table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT,
                is_custom BOOLEAN DEFAULT FALSE,
                public_token TEXT UNIQUE,
                epg_url TEXT,
                last_sync TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

        # Add missing columns if needed
        try:
            cursor.execute("ALTER TABLE channels ADD COLUMN position INTEGER;")
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute("ALTER TABLE channels ADD COLUMN tvg_id TEXT;")
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute("ALTER TABLE playlists ADD COLUMN epg_url TEXT;")
        except sqlite3.OperationalError:
            pass

if __name__ == "__main__":
    init_db()
