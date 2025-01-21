import sqlite3
from sqlite3 import Connection
from typing import Optional
from pathlib import Path

DATABASE_PATH = Path("data/playlists.db")

def get_db() -> Connection:
    """Create a database connection and return it"""
    DATABASE_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db()
    cursor = conn.cursor()

    # Create playlists table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT,
            is_custom BOOLEAN DEFAULT FALSE,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
        )
    """)

    # Create custom_playlist_channels table for mapping channels to custom playlists
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

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
